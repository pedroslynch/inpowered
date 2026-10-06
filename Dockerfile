# Demo image: Angular + Spring Boot + PostgreSQL in a single container.
# The database lives inside the container and is recreated (with the db/seed sample data) on every start.

# 1. Angular build
FROM node:24-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2. Spring Boot jar, with the Angular build served from classpath:/static
FROM eclipse-temurin:17-jdk AS backend
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -q -B dependency:go-offline
COPY src src
COPY --from=frontend /frontend/dist/frontend/browser src/main/resources/static
RUN ./mvnw -q -B package -DskipTests

# 3. Runtime: the official PostgreSQL image plus a Java 17 runtime
FROM postgres:17
ENV JAVA_HOME=/opt/java/openjdk \
	PATH=/opt/java/openjdk/bin:$PATH \
	POSTGRES_DB=inpowered \
	POSTGRES_USER=inpowered \
	POSTGRES_PASSWORD=inpowered \
	JAVA_OPTS="-XX:+UseSerialGC -Xmx256m -Xss512k -XX:MaxMetaspaceSize=160m -XX:ReservedCodeCacheSize=48m -XX:TieredStopAtLevel=1" \
	SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=5 \
	SERVER_TOMCAT_THREADS_MAX=20
COPY --from=eclipse-temurin:17-jre /opt/java/openjdk /opt/java/openjdk
RUN useradd --system --no-create-home app
WORKDIR /app
COPY --from=backend /app/target/*.jar app.jar
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["entrypoint.sh"]
