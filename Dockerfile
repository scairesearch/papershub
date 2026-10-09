FROM hexpm/elixir:1.18.4-erlang-27.3.4.16-debian-bookworm-20260824-slim AS build

RUN apt-get update -y && apt-get install -y build-essential git ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV MIX_ENV=prod

COPY mix.exs mix.lock ./
RUN mix local.hex --force && mix local.rebar --force && mix deps.get --only prod

COPY config config
COPY lib lib
COPY priv priv

RUN mix compile
RUN mix phx.digest
RUN mix release

FROM debian:bookworm-slim AS app
RUN apt-get update -y && apt-get install -y libstdc++6 openssl libncurses5 locales ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 MIX_ENV=prod PHX_SERVER=true PORT=8080

WORKDIR /app
COPY --from=build /app/_build/prod/rel/scai ./
EXPOSE 8080
CMD ["bin/scai", "start"]
