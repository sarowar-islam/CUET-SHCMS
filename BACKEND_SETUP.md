# CUET-SHCMS - Spring Boot Backend Requirements

## Project Setup

### Spring Boot Version
- **Spring Boot 3.4.x** (latest stable)
- **Java 21** (LTS)

### Required Dependencies (Maven)

Add these to your `pom.xml`:

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- JWT for Authentication -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.6</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok (optional but recommended) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Development Tools -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Required Dependencies (Gradle)

Or add these to your `build.gradle`:

```gradle
dependencies {
    // Spring Boot Starters
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    
    // PostgreSQL Driver
    runtimeOnly 'org.postgresql:postgresql'
    
    // JWT for Authentication
    implementation 'io.jsonwebtoken:jjwt-api:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.6'
    
    // Lombok (optional)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    
    // Development Tools
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    
    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
}
```

## Application Configuration

Create `src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: cuet-shcms
  
  datasource:
    url: jdbc:postgresql://${DB_HOST:your-neon-host}/${DB_NAME:cuet_shcms}
    username: ${DB_USER:your-username}
    password: ${DB_PASSWORD:your-password}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 30000
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        jdbc:
          time_zone: Asia/Dhaka
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

server:
  port: 8080
  servlet:
    context-path: /api

jwt:
  secret: ${JWT_SECRET:your-secret-key-change-this-in-production-must-be-at-least-256-bits}
  expiration: 86400000 # 24 hours in milliseconds

cors:
  allowed-origins: http://localhost:5173,http://localhost:4173
  allowed-methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

## Environment Variables

Create `.env` file in your Spring Boot project root:

```env
# NeonDB PostgreSQL Connection
DB_HOST=your-neon-host.neon.tech
DB_NAME=cuet_shcms
DB_USER=your-neon-username
DB_PASSWORD=your-neon-password

# JWT Secret (generate a secure random string)
JWT_SECRET=your-very-secure-secret-key-at-least-256-bits-long

# Application Settings
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
```

## NeonDB Setup Steps

1. **Create NeonDB Account** at https://neon.tech
2. **Create a new project**
3. **Get connection string** from dashboard
   - Format: `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`
4. **Extract credentials** and add to your `.env` file
5. **Enable connection pooling** (recommended for Neon)

## Project Structure

Recommended Spring Boot structure:

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── cuet/
│   │   │           └── shcms/
│   │   │               ├── CuetShcmsApplication.java
│   │   │               ├── config/
│   │   │               │   ├── SecurityConfig.java
│   │   │               │   ├── CorsConfig.java
│   │   │               │   └── JwtConfig.java
│   │   │               ├── controller/
│   │   │               │   ├── AuthController.java
│   │   │               │   ├── ComplaintController.java
│   │   │               │   └── UserController.java
│   │   │               ├── dto/
│   │   │               │   ├── LoginRequest.java
│   │   │               │   ├── LoginResponse.java
│   │   │               │   └── ComplaintDTO.java
│   │   │               ├── entity/
│   │   │               │   ├── User.java
│   │   │               │   ├── Complaint.java
│   │   │               │   └── Role.java
│   │   │               ├── repository/
│   │   │               │   ├── UserRepository.java
│   │   │               │   └── ComplaintRepository.java
│   │   │               ├── service/
│   │   │               │   ├── AuthService.java
│   │   │               │   ├── ComplaintService.java
│   │   │               │   └── UserService.java
│   │   │               ├── security/
│   │   │               │   ├── JwtTokenProvider.java
│   │   │               │   ├── JwtAuthenticationFilter.java
│   │   │               │   └── UserDetailsServiceImpl.java
│   │   │               └── exception/
│   │   │                   ├── GlobalExceptionHandler.java
│   │   │                   └── ResourceNotFoundException.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── application-dev.yml
│   └── test/
│       └── java/
└── pom.xml (or build.gradle)
```

## Key Configuration Classes Needed

### 1. CORS Configuration
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 2. Security Configuration
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter(), 
                UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

## API Endpoints Structure

Your backend should expose these endpoints:

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/complaints
POST   /api/complaints
GET    /api/complaints/{id}
PUT    /api/complaints/{id}
DELETE /api/complaints/{id}
PATCH  /api/complaints/{id}/status

GET    /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
```

## Frontend Integration

The frontend is configured to connect to your backend:
- Base URL: `http://localhost:8080/api`
- Axios instance with JWT token interceptor
- CORS enabled for `localhost:5173`

## Next Steps

1. Create Spring Boot project with the dependencies above
2. Set up NeonDB and get connection credentials
3. Configure `application.yml` with NeonDB credentials
4. Implement entity models matching your frontend data structures
5. Create JWT authentication system
6. Implement REST controllers
7. Test endpoints with the frontend

Frontend is now clean and ready to connect to your Spring Boot backend!
