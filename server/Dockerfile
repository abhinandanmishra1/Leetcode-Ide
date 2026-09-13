FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

# 1. System packages & compiler runtimes (GCC, G++, Java 17, Python 3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ \
    openjdk-17-jdk-headless \
    python3 \
    curl ca-certificates time \
    && rm -rf /var/lib/apt/lists/*

# 2. Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# 3. TypeScript global compiler
RUN npm install -g typescript

# 4. Create unprivileged runner user
RUN useradd -m -u 1001 -s /bin/bash runner \
    && mkdir -p /tmp/codebox \
    && chown -R runner:runner /tmp/codebox

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 5001
CMD ["node", "src/index.js"]
