package com.example.backend.repository;

import com.example.backend.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;


public interface InvalidatedTokenRepository  extends JpaRepository<InvalidatedToken, String> {
}
