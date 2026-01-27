FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# 1) baixa dependências (cache)
COPY pom.xml .
RUN mvn -DskipTests dependency:go-offline

# 2) copia código e compila
COPY src ./src
RUN mvn -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

