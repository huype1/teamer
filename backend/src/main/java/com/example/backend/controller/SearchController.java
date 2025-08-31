package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.IssueResponse;
import com.example.backend.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SearchController {

    SearchService searchService;

    @GetMapping("/issues")
    public ApiResponse<List<IssueResponse>> searchIssues(@RequestParam String keyword) {
        log.info("Searching issues for keyword: {}", keyword);
        
        List<IssueResponse> results = searchService.searchIssues(keyword);
        
        return ApiResponse.<List<IssueResponse>>builder()
                .message("Search completed successfully")
                .result(results)
                .build();
    }
}
