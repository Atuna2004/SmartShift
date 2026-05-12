# Architecture

Backend: Modular Monolith (Express + TS)

Structure:

modules/
- auth
- user
- organization

Flow:
Route → Controller → Service → Model

Frontend:
Feature-based
Redux Toolkit