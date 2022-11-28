# Puran Boi Server

## Live

> - https://puranboi.vercel.app

## Overview (Techs and Features)

> - `MongoDB` as Database
>   - Incorporates CRUD Operations
>   - Aggregation
>   - Transaction
> - `dotenv` to load sensitive data from Environment Variable
> - `cookie-parser` middleware to facilitate cookie read/write
> - `jsonwebtoken` package to sign and verify JWT
>   - JWT saved as `HTTP-Only` Cookie at Client Storage
> - `cors` middleware to allow only two web clients deployed on Firebase Hosting, and localhost only when in non-production mode
> - `stripe` for creating PaymentIntent
