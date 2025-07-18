package com.example.backend.config;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
public class OpenApiConfiguration {

    @Bean
    public OpenAPI defineOpenApi() {
        Server server = new Server();
        server.setUrl("http://localhost:8080/api");
        server.setDescription("Development Server");

        Contact myContact = new Contact();
        myContact.setName("Huy pe");
        myContact.setEmail("huype2004@gmail.com");

        Info information = new Info()
                .title("Teamer: Agile Scrum Project Management API")
                .version("1.0")
                .description("This is the API documentation for Teamer, an Agile Scrum Project Management tool.")
                .contact(myContact);
        return new OpenAPI().info(information).servers(List.of(server));
    }
}
