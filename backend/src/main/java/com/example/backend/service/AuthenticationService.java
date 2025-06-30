package com.example.backend.service;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.request.AuthenticationRequest;
import com.example.backend.dto.request.GoogleLoginRequest;
import com.example.backend.dto.request.IntrospectRequest;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.IntrospectResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.InvalidatedToken;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.InvalidatedTokenRepository;
import com.example.backend.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;

    @Autowired
    UserMapper userMapper;

    @Autowired
    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            log.info("Introspecting token: {}", token != null ? token.substring(0, Math.min(50, token.length())) + "..." : "null");
            verifyToken(token, false);
            log.info("Token introspection successful");
        } catch (AppException e) {
            log.error("Token introspection failed: {}", e.getMessage());
            isValid = false;
        } catch (Exception e) {
            log.error("Unexpected error during token introspection: {}", e.getMessage(), e);
            isValid = false;
        }
        return IntrospectResponse.builder().valid(isValid).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("Authenticating with name: {} {}", request.getEmail(), request.getPassword());
        User user = userRepository
                .findByEmail(request.getEmail())
                .or(() -> userRepository.findByName(request.getEmail()))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String token = generateToken(user);
        UserResponse userResponse = userMapper.toUserResponse(user);

        return AuthenticationResponse.builder()
                .token(token)
                .user(userResponse)
                .authenticated(true)
                .build();
    }

    public void logout(IntrospectRequest request) throws ParseException, JOSEException {
        log.info("Logout attempt with token: {}", request.getToken());
        try {
            var signedToken = verifyToken(request.getToken(), false);
            log.info("Token verified successfully for logout");
            String jit = signedToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signedToken.getJWTClaimsSet().getExpirationTime();
            log.info("Invalidating token with JIT: {}", jit);

            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

            invalidatedTokenRepository.save(invalidatedToken);
            log.info("Token invalidated successfully");
        } catch (AppException e) {
            log.error("Token validation failed during logout: {}", e.getMessage());
            throw e; // Re-throw to see the actual error
        }
    }

    public AuthenticationResponse authenticateWithGoogle(GoogleLoginRequest request) {
        try {
            // Verify Google ID token (optional - bạn có thể bỏ qua bước này nếu tin tưởng frontend)
            // GoogleIdToken idToken = verifyGoogleToken(request.getIdToken());

            User user = userRepository.findByEmail(request.getEmail()).orElseGet(() -> createUserFromGoogle(request));

            // Tạo JWT token cho hệ thống của bạn
            var token = generateToken(user);

            return AuthenticationResponse.builder()
                    .token(token)
                    .authenticated(true)
                    .user(userMapper.toUserResponse(user))
                    .build();
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    private User createUserFromGoogle(GoogleLoginRequest request) {
        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .avatarUrl(request.getPicture())
                .password(null)
                .provider("GOOGLE")
                .build();

        return userRepository.save(user);
    }

    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId().toString())
                .issuer("http://localhost:5173")
                .claim("email", user.getEmail())
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            System.out.println("Error signing token");
            throw new RuntimeException(e);
        }
    }

    public AuthenticationResponse refreshToken(IntrospectRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken(), true);

        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).token(request.getToken()).build();

        invalidatedTokenRepository.save(invalidatedToken);

        var name = signedJWT.getJWTClaimsSet().getSubject();

        var user = userRepository.findByName(name).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        String token = generateToken(user);
        UserResponse userResponse = userMapper.toUserResponse(user);

        return AuthenticationResponse.builder()
                .token(token)
                .user(userResponse)
                .authenticated(true)
                .build();
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        if (token == null || token.trim().isEmpty()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED); // Handle null or empty token
        }
        
        // Clean the token and validate format
        token = token.trim();
        if (!isValidJWTFormat(token)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes(StandardCharsets.UTF_8));

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expirationTime = (isRefresh)
                ? new Date(signedJWT
                .getJWTClaimsSet()
                .getIssueTime()
                .toInstant()
                .plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS)
                .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();
        Date currentTime = new Date();
        var verified = signedJWT.verify(verifier);
        log.info("Token verification result: {}", verified);
        log.info("Token expiration time: {}", expirationTime);
        log.info("Current time: {}", currentTime);
        log.info("Token expired: {}", currentTime.after(expirationTime));

        if (!(verified && expirationTime.after(new Date()))) {
            log.error("Token validation failed - verified: {}, expired: {}", verified, currentTime.after(expirationTime));
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            log.error("Token has been invalidated with JIT: {}", signedJWT.getJWTClaimsSet().getJWTID());
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return signedJWT;
    }
    
    private boolean isValidJWTFormat(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        
        // Check if token has exactly 3 parts separated by dots
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            log.error("Invalid JWT format: expected 3 parts, got {}", parts.length);
            return false;
        }
        
        // Basic validation that parts are not empty
        for (String part : parts) {
            if (part == null || part.isEmpty()) {
                log.error("Invalid JWT format: empty part found");
                return false;
            }
        }
        
        return true;
    }
}
