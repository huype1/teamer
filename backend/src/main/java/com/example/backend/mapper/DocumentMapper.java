package com.example.backend.mapper;

import com.example.backend.dto.response.DocumentListResponse;
import com.example.backend.dto.response.DocumentResponse;
import com.example.backend.entity.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface DocumentMapper {

    DocumentMapper INSTANCE = Mappers.getMapper(DocumentMapper.class);

    @Mapping(source = "creator", target = "creator")
    @Mapping(source = "project.id", target = "projectId")
    DocumentResponse toResponse(Document document);

    @Mapping(source = "creator", target = "creator")
    @Mapping(source = "project.id", target = "projectId")
    DocumentListResponse toListResponse(Document document);

    List<DocumentResponse> toResponseList(List<Document> documents);

    List<DocumentListResponse> toListResponseList(List<Document> documents);
}