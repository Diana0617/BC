--
-- PostgreSQL database dump
--

-- Dumped from database version 17.7 (178558d)
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.whatsapp_webhook_events DROP CONSTRAINT IF EXISTS whatsapp_webhook_events_business_id_fkey;
ALTER TABLE IF EXISTS ONLY public.whatsapp_tokens DROP CONSTRAINT IF EXISTS whatsapp_tokens_business_id_fkey;
ALTER TABLE IF EXISTS ONLY public.whatsapp_messages DROP CONSTRAINT IF EXISTS whatsapp_messages_client_id_fkey;
ALTER TABLE IF EXISTS ONLY public.whatsapp_messages DROP CONSTRAINT IF EXISTS whatsapp_messages_business_id_fkey;
ALTER TABLE IF EXISTS ONLY public.whatsapp_messages DROP CONSTRAINT IF EXISTS whatsapp_messages_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.whatsapp_message_templates DROP CONSTRAINT IF EXISTS whatsapp_message_templates_business_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "users_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.user_branches DROP CONSTRAINT IF EXISTS "user_branches_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.user_branches DROP CONSTRAINT IF EXISTS "user_branches_branchId_fkey";
ALTER TABLE IF EXISTS ONLY public.user_branches DROP CONSTRAINT IF EXISTS "user_branches_assignedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.subscription_payments DROP CONSTRAINT IF EXISTS "subscription_payments_receiptUploadedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.subscription_payments DROP CONSTRAINT IF EXISTS "subscription_payments_paymentConfigurationId_fkey";
ALTER TABLE IF EXISTS ONLY public.subscription_payments DROP CONSTRAINT IF EXISTS "subscription_payments_originalPaymentId_fkey";
ALTER TABLE IF EXISTS ONLY public.subscription_payments DROP CONSTRAINT IF EXISTS "subscription_payments_businessSubscriptionId_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_services DROP CONSTRAINT IF EXISTS "specialist_services_specialistId_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_services DROP CONSTRAINT IF EXISTS "specialist_services_serviceId_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_services DROP CONSTRAINT IF EXISTS "specialist_services_assignedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_profiles DROP CONSTRAINT IF EXISTS "specialist_profiles_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_profiles DROP CONSTRAINT IF EXISTS "specialist_profiles_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_documents DROP CONSTRAINT IF EXISTS "specialist_documents_uploadedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_documents DROP CONSTRAINT IF EXISTS "specialist_documents_specialistId_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_documents DROP CONSTRAINT IF EXISTS "specialist_documents_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_documents DROP CONSTRAINT IF EXISTS "specialist_documents_approvedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_commissions DROP CONSTRAINT IF EXISTS "specialist_commissions_specialistId_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_commissions DROP CONSTRAINT IF EXISTS "specialist_commissions_serviceId_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_commissions DROP CONSTRAINT IF EXISTS "specialist_commissions_createdBy_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_commissions DROP CONSTRAINT IF EXISTS "specialist_commissions_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_branch_schedules DROP CONSTRAINT IF EXISTS "specialist_branch_schedules_specialistId_fkey";
ALTER TABLE IF EXISTS ONLY public.specialist_branch_schedules DROP CONSTRAINT IF EXISTS "specialist_branch_schedules_branchId_fkey";
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS "services_consentTemplateId_fkey";
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS "services_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.service_commissions DROP CONSTRAINT IF EXISTS "service_commissions_serviceId_fkey";
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS "products_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.plan_modules DROP CONSTRAINT IF EXISTS "plan_modules_subscriptionPlanId_fkey";
ALTER TABLE IF EXISTS ONLY public.plan_modules DROP CONSTRAINT IF EXISTS "plan_modules_moduleId_fkey";
ALTER TABLE IF EXISTS ONLY public.payment_integrations DROP CONSTRAINT IF EXISTS "payment_integrations_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS "password_reset_tokens_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.owner_expenses DROP CONSTRAINT IF EXISTS "owner_expenses_createdBy_fkey";
ALTER TABLE IF EXISTS ONLY public.owner_expenses DROP CONSTRAINT IF EXISTS "owner_expenses_approvedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS "inventory_movements_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_to_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_specialist_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS "inventory_movements_productId_fkey";
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_from_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS "inventory_movements_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.financial_movements DROP CONSTRAINT IF EXISTS "financial_movements_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.financial_movements DROP CONSTRAINT IF EXISTS "financial_movements_clientId_fkey";
ALTER TABLE IF EXISTS ONLY public.financial_movements DROP CONSTRAINT IF EXISTS "financial_movements_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.financial_movements DROP CONSTRAINT IF EXISTS "financial_movements_businessExpenseId_fkey";
ALTER TABLE IF EXISTS ONLY public.financial_movements DROP CONSTRAINT IF EXISTS "financial_movements_businessExpenseCategoryId_fkey";
ALTER TABLE IF EXISTS ONLY public.consent_templates DROP CONSTRAINT IF EXISTS "consent_templates_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.consent_signatures DROP CONSTRAINT IF EXISTS "consent_signatures_serviceId_fkey";
ALTER TABLE IF EXISTS ONLY public.consent_signatures DROP CONSTRAINT IF EXISTS "consent_signatures_revokedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.consent_signatures DROP CONSTRAINT IF EXISTS "consent_signatures_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.consent_signatures DROP CONSTRAINT IF EXISTS "consent_signatures_consentTemplateId_fkey";
ALTER TABLE IF EXISTS ONLY public.consent_signatures DROP CONSTRAINT IF EXISTS "consent_signatures_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.consent_signatures DROP CONSTRAINT IF EXISTS "consent_signatures_appointmentId_fkey";
ALTER TABLE IF EXISTS ONLY public.commission_payment_requests DROP CONSTRAINT IF EXISTS "commission_payment_requests_specialistId_fkey";
ALTER TABLE IF EXISTS ONLY public.commission_payment_requests DROP CONSTRAINT IF EXISTS "commission_payment_requests_reviewedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.commission_payment_requests DROP CONSTRAINT IF EXISTS "commission_payment_requests_paidBy_fkey";
ALTER TABLE IF EXISTS ONLY public.commission_payment_requests DROP CONSTRAINT IF EXISTS "commission_payment_requests_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.commission_details DROP CONSTRAINT IF EXISTS "commission_details_serviceId_fkey";
ALTER TABLE IF EXISTS ONLY public.commission_details DROP CONSTRAINT IF EXISTS "commission_details_paymentRequestId_fkey";
ALTER TABLE IF EXISTS ONLY public.commission_details DROP CONSTRAINT IF EXISTS "commission_details_clientId_fkey";
ALTER TABLE IF EXISTS ONLY public.commission_details DROP CONSTRAINT IF EXISTS "commission_details_appointmentId_fkey";
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_business_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_register_shifts DROP CONSTRAINT IF EXISTS cash_register_shifts_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_register_shifts DROP CONSTRAINT IF EXISTS cash_register_shifts_business_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_register_shifts DROP CONSTRAINT IF EXISTS cash_register_shifts_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.businesses DROP CONSTRAINT IF EXISTS "businesses_currentPlanId_fkey";
ALTER TABLE IF EXISTS ONLY public.business_subscriptions DROP CONSTRAINT IF EXISTS "business_subscriptions_subscriptionPlanId_fkey";
ALTER TABLE IF EXISTS ONLY public.business_subscriptions DROP CONSTRAINT IF EXISTS "business_subscriptions_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.business_rules DROP CONSTRAINT IF EXISTS "business_rules_updatedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.business_rules DROP CONSTRAINT IF EXISTS "business_rules_ruleTemplateId_fkey";
ALTER TABLE IF EXISTS ONLY public.business_rules DROP CONSTRAINT IF EXISTS "business_rules_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.business_expenses DROP CONSTRAINT IF EXISTS "business_expenses_updatedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.business_expenses DROP CONSTRAINT IF EXISTS "business_expenses_createdBy_fkey";
ALTER TABLE IF EXISTS ONLY public.business_expenses DROP CONSTRAINT IF EXISTS "business_expenses_categoryId_fkey";
ALTER TABLE IF EXISTS ONLY public.business_expenses DROP CONSTRAINT IF EXISTS "business_expenses_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.business_expenses DROP CONSTRAINT IF EXISTS "business_expenses_approvedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.business_expense_categories DROP CONSTRAINT IF EXISTS "business_expense_categories_updatedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.business_expense_categories DROP CONSTRAINT IF EXISTS "business_expense_categories_createdBy_fkey";
ALTER TABLE IF EXISTS ONLY public.business_expense_categories DROP CONSTRAINT IF EXISTS "business_expense_categories_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.business_commission_configs DROP CONSTRAINT IF EXISTS "business_commission_configs_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.business_clients DROP CONSTRAINT IF EXISTS "business_clients_preferredSpecialistId_fkey";
ALTER TABLE IF EXISTS ONLY public.business_clients DROP CONSTRAINT IF EXISTS "business_clients_clientId_fkey";
ALTER TABLE IF EXISTS ONLY public.business_clients DROP CONSTRAINT IF EXISTS "business_clients_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS "branches_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "appointments_specialistId_fkey";
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "appointments_serviceId_fkey";
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "appointments_clientId_fkey";
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "appointments_canceledBy_fkey";
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "appointments_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "appointments_branchId_fkey";
DROP INDEX IF EXISTS public.whatsapp_webhook_events_received_at;
DROP INDEX IF EXISTS public.whatsapp_webhook_events_processed;
DROP INDEX IF EXISTS public.whatsapp_webhook_events_message_id;
DROP INDEX IF EXISTS public.whatsapp_webhook_events_event_type;
DROP INDEX IF EXISTS public.whatsapp_webhook_events_business_id;
DROP INDEX IF EXISTS public.whatsapp_tokens_is_active;
DROP INDEX IF EXISTS public.whatsapp_tokens_expires_at;
DROP INDEX IF EXISTS public.whatsapp_tokens_business_id;
DROP INDEX IF EXISTS public.whatsapp_messages_status;
DROP INDEX IF EXISTS public.whatsapp_messages_provider_message_id;
DROP INDEX IF EXISTS public.whatsapp_messages_created_at;
DROP INDEX IF EXISTS public.whatsapp_messages_client_id;
DROP INDEX IF EXISTS public.whatsapp_messages_business_id;
DROP INDEX IF EXISTS public.whatsapp_messages_appointment_id;
DROP INDEX IF EXISTS public.whatsapp_message_templates_status;
DROP INDEX IF EXISTS public.whatsapp_message_templates_business_id_template_name;
DROP INDEX IF EXISTS public.whatsapp_message_templates_business_id;
DROP INDEX IF EXISTS public.unique_user_branch;
DROP INDEX IF EXISTS public.unique_transaction_id;
DROP INDEX IF EXISTS public.unique_specialist_service_commission;
DROP INDEX IF EXISTS public.unique_specialist_service;
DROP INDEX IF EXISTS public.unique_specialist_branch_day;
DROP INDEX IF EXISTS public.unique_report_period;
DROP INDEX IF EXISTS public.unique_main_branch_per_business;
DROP INDEX IF EXISTS public.unique_business_rule_template;
DROP INDEX IF EXISTS public.unique_business_consent_code;
DROP INDEX IF EXISTS public.unique_branch_code_per_business;
DROP INDEX IF EXISTS public.subscription_payments_transaction_id;
DROP INDEX IF EXISTS public.subscription_payments_status;
DROP INDEX IF EXISTS public.subscription_payments_payment_method;
DROP INDEX IF EXISTS public.subscription_payments_paid_at;
DROP INDEX IF EXISTS public.subscription_payments_due_date;
DROP INDEX IF EXISTS public.subscription_payments_business_subscription_id;
DROP INDEX IF EXISTS public.specialist_profiles_user_id;
DROP INDEX IF EXISTS public.specialist_profiles_status;
DROP INDEX IF EXISTS public.specialist_profiles_specialization;
DROP INDEX IF EXISTS public.specialist_profiles_is_active;
DROP INDEX IF EXISTS public.specialist_profiles_business_id;
DROP INDEX IF EXISTS public.specialist_documents_status;
DROP INDEX IF EXISTS public.specialist_documents_specialist_id;
DROP INDEX IF EXISTS public.specialist_documents_document_type;
DROP INDEX IF EXISTS public.specialist_documents_business_id;
DROP INDEX IF EXISTS public.specialist_day_schedule;
DROP INDEX IF EXISTS public.specialist_commissions_specialist_id;
DROP INDEX IF EXISTS public.specialist_commissions_service_id;
DROP INDEX IF EXISTS public.specialist_commissions_is_active;
DROP INDEX IF EXISTS public.specialist_commissions_business_id;
DROP INDEX IF EXISTS public.services_is_package;
DROP INDEX IF EXISTS public.services_business_id_is_active;
DROP INDEX IF EXISTS public.services_business_id_category;
DROP INDEX IF EXISTS public.service_commissions_service_id;
DROP INDEX IF EXISTS public.rule_templates_type;
DROP INDEX IF EXISTS public.rule_templates_key;
DROP INDEX IF EXISTS public.rule_templates_is_active;
DROP INDEX IF EXISTS public.rule_templates_category;
DROP INDEX IF EXISTS public.products_sku_business_id;
DROP INDEX IF EXISTS public.products_business_id_is_active;
DROP INDEX IF EXISTS public.products_business_id_category;
DROP INDEX IF EXISTS public.products_barcode;
DROP INDEX IF EXISTS public.plan_modules_subscription_plan_id_module_id;
DROP INDEX IF EXISTS public.payment_integrations_business_id_provider_name;
DROP INDEX IF EXISTS public.payment_integrations_business_id_provider;
DROP INDEX IF EXISTS public.payment_integrations_business_id_is_active;
DROP INDEX IF EXISTS public.password_reset_tokens_user_id;
DROP INDEX IF EXISTS public.password_reset_tokens_token_is_used_expires_at;
DROP INDEX IF EXISTS public.password_reset_tokens_token;
DROP INDEX IF EXISTS public.password_reset_tokens_is_used;
DROP INDEX IF EXISTS public.password_reset_tokens_expires_at;
DROP INDEX IF EXISTS public.owner_payment_configurations_provider;
DROP INDEX IF EXISTS public.owner_payment_configurations_is_default;
DROP INDEX IF EXISTS public.owner_payment_configurations_is_active;
DROP INDEX IF EXISTS public.owner_financial_reports_status;
DROP INDEX IF EXISTS public.owner_financial_reports_start_date_end_date;
DROP INDEX IF EXISTS public.owner_financial_reports_report_type;
DROP INDEX IF EXISTS public.owner_financial_reports_report_period;
DROP INDEX IF EXISTS public.owner_financial_reports_generated_at;
DROP INDEX IF EXISTS public.owner_expenses_vendor;
DROP INDEX IF EXISTS public.owner_expenses_status;
DROP INDEX IF EXISTS public.owner_expenses_is_active;
DROP INDEX IF EXISTS public.owner_expenses_expense_date_category_status;
DROP INDEX IF EXISTS public.owner_expenses_expense_date;
DROP INDEX IF EXISTS public.owner_expenses_created_by;
DROP INDEX IF EXISTS public.owner_expenses_category;
DROP INDEX IF EXISTS public.inventory_movements_user_id_business_id;
DROP INDEX IF EXISTS public.inventory_movements_reference_id_reference_type;
DROP INDEX IF EXISTS public.inventory_movements_business_id_product_id;
DROP INDEX IF EXISTS public.inventory_movements_business_id_movement_type;
DROP INDEX IF EXISTS public.idx_user_branch_user;
DROP INDEX IF EXISTS public.idx_user_branch_default;
DROP INDEX IF EXISTS public.idx_user_branch_branch;
DROP INDEX IF EXISTS public.idx_specialist_service_specialist;
DROP INDEX IF EXISTS public.idx_specialist_service_service;
DROP INDEX IF EXISTS public.idx_specialist_service_bookable;
DROP INDEX IF EXISTS public.idx_specialist_service_active;
DROP INDEX IF EXISTS public.financial_movements_user_id_business_id;
DROP INDEX IF EXISTS public.financial_movements_transaction_id;
DROP INDEX IF EXISTS public.financial_movements_reference_id_reference_type;
DROP INDEX IF EXISTS public.financial_movements_client_id_business_id;
DROP INDEX IF EXISTS public.financial_movements_business_id_type;
DROP INDEX IF EXISTS public.financial_movements_business_id_status;
DROP INDEX IF EXISTS public.financial_movements_business_id_category;
DROP INDEX IF EXISTS public.consent_templates_code;
DROP INDEX IF EXISTS public.consent_templates_business_id_is_active;
DROP INDEX IF EXISTS public.consent_templates_business_id_category;
DROP INDEX IF EXISTS public.consent_signatures_status;
DROP INDEX IF EXISTS public.consent_signatures_signed_at;
DROP INDEX IF EXISTS public.consent_signatures_service_id;
DROP INDEX IF EXISTS public.consent_signatures_customer_id_consent_template_id;
DROP INDEX IF EXISTS public.consent_signatures_consent_template_id;
DROP INDEX IF EXISTS public.consent_signatures_business_id_customer_id;
DROP INDEX IF EXISTS public.consent_signatures_appointment_id;
DROP INDEX IF EXISTS public.commission_payment_requests_status;
DROP INDEX IF EXISTS public.commission_payment_requests_specialist_id;
DROP INDEX IF EXISTS public.commission_payment_requests_request_number;
DROP INDEX IF EXISTS public.commission_payment_requests_period_from_period_to;
DROP INDEX IF EXISTS public.commission_payment_requests_business_id;
DROP INDEX IF EXISTS public.commission_details_service_id;
DROP INDEX IF EXISTS public.commission_details_service_date;
DROP INDEX IF EXISTS public.commission_details_payment_status;
DROP INDEX IF EXISTS public.commission_details_payment_request_id;
DROP INDEX IF EXISTS public.commission_details_client_id;
DROP INDEX IF EXISTS public.commission_details_appointment_id;
DROP INDEX IF EXISTS public.cash_register_shifts_user_id_status;
DROP INDEX IF EXISTS public.cash_register_shifts_status_opened_at;
DROP INDEX IF EXISTS public.cash_register_shifts_business_id_opened_at;
DROP INDEX IF EXISTS public.cash_register_shifts_branch_id_opened_at;
DROP INDEX IF EXISTS public.business_rules_rule_template_id;
DROP INDEX IF EXISTS public.business_rules_is_active;
DROP INDEX IF EXISTS public.business_rules_business_id;
DROP INDEX IF EXISTS public.business_expenses_vendor;
DROP INDEX IF EXISTS public.business_expenses_created_by;
DROP INDEX IF EXISTS public.business_expenses_business_id_status;
DROP INDEX IF EXISTS public.business_expenses_business_id_is_active;
DROP INDEX IF EXISTS public.business_expenses_business_id_expense_date;
DROP INDEX IF EXISTS public.business_expenses_business_id_category_id;
DROP INDEX IF EXISTS public.business_expense_categories_business_id_name;
DROP INDEX IF EXISTS public.business_expense_categories_business_id_is_active;
DROP INDEX IF EXISTS public.business_commission_configs_business_id;
DROP INDEX IF EXISTS public.business_clients_client_number_business_id;
DROP INDEX IF EXISTS public.business_clients_business_id_status;
DROP INDEX IF EXISTS public.business_clients_business_id_client_id;
DROP INDEX IF EXISTS public.branch_day_schedule;
DROP INDEX IF EXISTS public.appointments_status_business_id;
DROP INDEX IF EXISTS public.appointments_specialist_id_start_time;
DROP INDEX IF EXISTS public.appointments_client_id_business_id;
DROP INDEX IF EXISTS public.appointments_business_id_start_time;
DROP INDEX IF EXISTS public.appointments_appointment_number;
ALTER TABLE IF EXISTS ONLY public.whatsapp_webhook_events DROP CONSTRAINT IF EXISTS whatsapp_webhook_events_pkey;
ALTER TABLE IF EXISTS ONLY public.whatsapp_tokens DROP CONSTRAINT IF EXISTS whatsapp_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.whatsapp_tokens DROP CONSTRAINT IF EXISTS whatsapp_tokens_business_id_key;
ALTER TABLE IF EXISTS ONLY public.whatsapp_messages DROP CONSTRAINT IF EXISTS whatsapp_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.whatsapp_message_templates DROP CONSTRAINT IF EXISTS whatsapp_message_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key2;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key1;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_branches DROP CONSTRAINT IF EXISTS "user_branches_userId_branchId_key";
ALTER TABLE IF EXISTS ONLY public.user_branches DROP CONSTRAINT IF EXISTS user_branches_pkey;
ALTER TABLE IF EXISTS ONLY public.subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.subscription_payments DROP CONSTRAINT IF EXISTS subscription_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.specialist_services DROP CONSTRAINT IF EXISTS "specialist_services_specialistId_serviceId_key";
ALTER TABLE IF EXISTS ONLY public.specialist_services DROP CONSTRAINT IF EXISTS specialist_services_pkey;
ALTER TABLE IF EXISTS ONLY public.specialist_profiles DROP CONSTRAINT IF EXISTS "specialist_profiles_userId_key";
ALTER TABLE IF EXISTS ONLY public.specialist_profiles DROP CONSTRAINT IF EXISTS specialist_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.specialist_documents DROP CONSTRAINT IF EXISTS specialist_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.specialist_commissions DROP CONSTRAINT IF EXISTS specialist_commissions_pkey;
ALTER TABLE IF EXISTS ONLY public.specialist_branch_schedules DROP CONSTRAINT IF EXISTS "specialist_branch_schedules_specialistId_branchId_key";
ALTER TABLE IF EXISTS ONLY public.specialist_branch_schedules DROP CONSTRAINT IF EXISTS specialist_branch_schedules_pkey;
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS services_pkey;
ALTER TABLE IF EXISTS ONLY public.service_commissions DROP CONSTRAINT IF EXISTS "service_commissions_serviceId_key";
ALTER TABLE IF EXISTS ONLY public.service_commissions DROP CONSTRAINT IF EXISTS service_commissions_pkey;
ALTER TABLE IF EXISTS ONLY public.rule_templates DROP CONSTRAINT IF EXISTS rule_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.plan_modules DROP CONSTRAINT IF EXISTS "plan_modules_subscriptionPlanId_moduleId_key";
ALTER TABLE IF EXISTS ONLY public.plan_modules DROP CONSTRAINT IF EXISTS plan_modules_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_integrations DROP CONSTRAINT IF EXISTS payment_integrations_pkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_token_key1;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_token_key;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.owner_payment_configurations DROP CONSTRAINT IF EXISTS owner_payment_configurations_pkey;
ALTER TABLE IF EXISTS ONLY public.owner_financial_reports DROP CONSTRAINT IF EXISTS owner_financial_reports_pkey;
ALTER TABLE IF EXISTS ONLY public.owner_expenses DROP CONSTRAINT IF EXISTS owner_expenses_pkey;
ALTER TABLE IF EXISTS ONLY public.modules DROP CONSTRAINT IF EXISTS modules_pkey;
ALTER TABLE IF EXISTS ONLY public.modules DROP CONSTRAINT IF EXISTS modules_name_key2;
ALTER TABLE IF EXISTS ONLY public.modules DROP CONSTRAINT IF EXISTS modules_name_key1;
ALTER TABLE IF EXISTS ONLY public.modules DROP CONSTRAINT IF EXISTS modules_name_key;
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_pkey;
ALTER TABLE IF EXISTS ONLY public.financial_movements DROP CONSTRAINT IF EXISTS financial_movements_pkey;
ALTER TABLE IF EXISTS ONLY public.consent_templates DROP CONSTRAINT IF EXISTS consent_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.consent_signatures DROP CONSTRAINT IF EXISTS consent_signatures_pkey;
ALTER TABLE IF EXISTS ONLY public.commission_payment_requests DROP CONSTRAINT IF EXISTS "commission_payment_requests_requestNumber_key1";
ALTER TABLE IF EXISTS ONLY public.commission_payment_requests DROP CONSTRAINT IF EXISTS "commission_payment_requests_requestNumber_key";
ALTER TABLE IF EXISTS ONLY public.commission_payment_requests DROP CONSTRAINT IF EXISTS commission_payment_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.commission_details DROP CONSTRAINT IF EXISTS commission_details_pkey;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_pkey;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_email_key2;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_email_key1;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_email_key;
ALTER TABLE IF EXISTS ONLY public.cash_register_shifts DROP CONSTRAINT IF EXISTS cash_register_shifts_pkey;
ALTER TABLE IF EXISTS ONLY public.businesses DROP CONSTRAINT IF EXISTS businesses_subdomain_key2;
ALTER TABLE IF EXISTS ONLY public.businesses DROP CONSTRAINT IF EXISTS businesses_subdomain_key1;
ALTER TABLE IF EXISTS ONLY public.businesses DROP CONSTRAINT IF EXISTS businesses_subdomain_key;
ALTER TABLE IF EXISTS ONLY public.businesses DROP CONSTRAINT IF EXISTS businesses_pkey;
ALTER TABLE IF EXISTS ONLY public.business_subscriptions DROP CONSTRAINT IF EXISTS business_subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.business_subscriptions DROP CONSTRAINT IF EXISTS "business_subscriptions_businessId_subscriptionPlanId_key";
ALTER TABLE IF EXISTS ONLY public.business_rules DROP CONSTRAINT IF EXISTS business_rules_pkey;
ALTER TABLE IF EXISTS ONLY public.business_expenses DROP CONSTRAINT IF EXISTS business_expenses_pkey;
ALTER TABLE IF EXISTS ONLY public.business_expense_categories DROP CONSTRAINT IF EXISTS business_expense_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.business_commission_configs DROP CONSTRAINT IF EXISTS business_commission_configs_pkey;
ALTER TABLE IF EXISTS ONLY public.business_commission_configs DROP CONSTRAINT IF EXISTS "business_commission_configs_businessId_key";
ALTER TABLE IF EXISTS ONLY public.business_clients DROP CONSTRAINT IF EXISTS business_clients_pkey;
ALTER TABLE IF EXISTS ONLY public.business_clients DROP CONSTRAINT IF EXISTS "business_clients_businessId_clientId_key";
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "appointments_appointmentNumber_key2";
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "appointments_appointmentNumber_key1";
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "appointments_appointmentNumber_key";
DROP TABLE IF EXISTS public.whatsapp_webhook_events;
DROP TABLE IF EXISTS public.whatsapp_tokens;
DROP TABLE IF EXISTS public.whatsapp_messages;
DROP TABLE IF EXISTS public.whatsapp_message_templates;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_branches;
DROP TABLE IF EXISTS public.subscription_plans;
DROP TABLE IF EXISTS public.subscription_payments;
DROP TABLE IF EXISTS public.specialist_services;
DROP TABLE IF EXISTS public.specialist_profiles;
DROP TABLE IF EXISTS public.specialist_documents;
DROP TABLE IF EXISTS public.specialist_commissions;
DROP TABLE IF EXISTS public.specialist_branch_schedules;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.service_commissions;
DROP TABLE IF EXISTS public.rule_templates;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.plan_modules;
DROP TABLE IF EXISTS public.payment_integrations;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP TABLE IF EXISTS public.owner_payment_configurations;
DROP TABLE IF EXISTS public.owner_financial_reports;
DROP TABLE IF EXISTS public.owner_expenses;
DROP TABLE IF EXISTS public.modules;
DROP TABLE IF EXISTS public.inventory_movements;
DROP TABLE IF EXISTS public.financial_movements;
DROP TABLE IF EXISTS public.consent_templates;
DROP TABLE IF EXISTS public.consent_signatures;
DROP TABLE IF EXISTS public.commission_payment_requests;
DROP TABLE IF EXISTS public.commission_details;
DROP TABLE IF EXISTS public.clients;
DROP TABLE IF EXISTS public.cash_register_shifts;
DROP TABLE IF EXISTS public.businesses;
DROP TABLE IF EXISTS public.business_subscriptions;
DROP TABLE IF EXISTS public.business_rules;
DROP TABLE IF EXISTS public.business_expenses;
DROP TABLE IF EXISTS public.business_expense_categories;
DROP TABLE IF EXISTS public.business_commission_configs;
DROP TABLE IF EXISTS public.business_clients;
DROP TABLE IF EXISTS public.branches;
DROP TABLE IF EXISTS public.appointments;
DROP TYPE IF EXISTS public.enum_users_status;
DROP TYPE IF EXISTS public.enum_users_role;
DROP TYPE IF EXISTS public.enum_subscription_plans_status;
DROP TYPE IF EXISTS public."enum_subscription_plans_durationType";
DROP TYPE IF EXISTS public."enum_subscription_plans_billingCycle";
DROP TYPE IF EXISTS public."enum_subscription_payments_threeDsAuthType";
DROP TYPE IF EXISTS public.enum_subscription_payments_status;
DROP TYPE IF EXISTS public."enum_subscription_payments_recurringType";
DROP TYPE IF EXISTS public."enum_subscription_payments_paymentMethod";
DROP TYPE IF EXISTS public."enum_subscription_payments_currentStepStatus";
DROP TYPE IF EXISTS public."enum_subscription_payments_currentStep";
DROP TYPE IF EXISTS public."enum_specialist_services_skillLevel";
DROP TYPE IF EXISTS public.enum_specialist_profiles_status;
DROP TYPE IF EXISTS public."enum_specialist_profiles_contractType";
DROP TYPE IF EXISTS public."enum_specialist_profiles_commissionType";
DROP TYPE IF EXISTS public.enum_specialist_documents_status;
DROP TYPE IF EXISTS public."enum_specialist_documents_documentType";
DROP TYPE IF EXISTS public."enum_specialist_commissions_paymentFrequency";
DROP TYPE IF EXISTS public."enum_specialist_commissions_commissionType";
DROP TYPE IF EXISTS public."enum_specialist_branch_schedules_dayOfWeek";
DROP TYPE IF EXISTS public."enum_services_packageType";
DROP TYPE IF EXISTS public.enum_service_commissions_type;
DROP TYPE IF EXISTS public.enum_rule_templates_type;
DROP TYPE IF EXISTS public.enum_rule_templates_category;
DROP TYPE IF EXISTS public.enum_products_product_type;
DROP TYPE IF EXISTS public.enum_payment_integrations_status;
DROP TYPE IF EXISTS public.enum_payment_integrations_provider;
DROP TYPE IF EXISTS public.enum_payment_integrations_environment;
DROP TYPE IF EXISTS public.enum_owner_payment_configurations_provider;
DROP TYPE IF EXISTS public.enum_owner_payment_configurations_environment;
DROP TYPE IF EXISTS public.enum_owner_financial_reports_status;
DROP TYPE IF EXISTS public."enum_owner_financial_reports_reportType";
DROP TYPE IF EXISTS public."enum_owner_financial_reports_generatedBy";
DROP TYPE IF EXISTS public.enum_owner_expenses_status;
DROP TYPE IF EXISTS public."enum_owner_expenses_recurringFrequency";
DROP TYPE IF EXISTS public."enum_owner_expenses_receiptType";
DROP TYPE IF EXISTS public.enum_owner_expenses_category;
DROP TYPE IF EXISTS public.enum_modules_status;
DROP TYPE IF EXISTS public.enum_modules_category;
DROP TYPE IF EXISTS public."enum_inventory_movements_movementType";
DROP TYPE IF EXISTS public.enum_financial_movements_type;
DROP TYPE IF EXISTS public.enum_financial_movements_status;
DROP TYPE IF EXISTS public."enum_financial_movements_paymentMethod";
DROP TYPE IF EXISTS public.enum_consent_signatures_status;
DROP TYPE IF EXISTS public."enum_consent_signatures_signatureType";
DROP TYPE IF EXISTS public.enum_commission_payment_requests_status;
DROP TYPE IF EXISTS public."enum_commission_payment_requests_paymentMethod";
DROP TYPE IF EXISTS public."enum_commission_details_paymentStatus";
DROP TYPE IF EXISTS public.enum_clients_status;
DROP TYPE IF EXISTS public.enum_clients_gender;
DROP TYPE IF EXISTS public.enum_cash_register_shifts_status;
DROP TYPE IF EXISTS public.enum_businesses_status;
DROP TYPE IF EXISTS public.enum_business_subscriptions_status;
DROP TYPE IF EXISTS public."enum_business_subscriptions_paymentStatus";
DROP TYPE IF EXISTS public."enum_business_subscriptions_billingCycle";
DROP TYPE IF EXISTS public.enum_business_expenses_status;
DROP TYPE IF EXISTS public."enum_business_expenses_recurringFrequency";
DROP TYPE IF EXISTS public."enum_business_expenses_receiptType";
DROP TYPE IF EXISTS public."enum_business_expenses_paymentMethod";
DROP TYPE IF EXISTS public."enum_business_commission_configs_calculationType";
DROP TYPE IF EXISTS public.enum_business_clients_status;
DROP TYPE IF EXISTS public.enum_branches_status;
DROP TYPE IF EXISTS public.enum_appointments_status;
DROP TYPE IF EXISTS public."enum_appointments_paymentStatus";
--
-- Name: enum_appointments_paymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_appointments_paymentStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'PAID',
    'REFUNDED'
);


--
-- Name: enum_appointments_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_appointments_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELED',
    'NO_SHOW',
    'RESCHEDULED'
);


--
-- Name: enum_branches_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_branches_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE'
);


--
-- Name: enum_business_clients_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_business_clients_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'BLOCKED',
    'VIP'
);


--
-- Name: enum_business_commission_configs_calculationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_business_commission_configs_calculationType" AS ENUM (
    'GENERAL',
    'POR_SERVICIO',
    'MIXTO'
);


--
-- Name: enum_business_expenses_paymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_business_expenses_paymentMethod" AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'CHECK',
    'DIGITAL_WALLET',
    'OTHER'
);


--
-- Name: enum_business_expenses_receiptType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_business_expenses_receiptType" AS ENUM (
    'IMAGE',
    'PDF'
);


--
-- Name: enum_business_expenses_recurringFrequency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_business_expenses_recurringFrequency" AS ENUM (
    'DAILY',
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
);


--
-- Name: enum_business_expenses_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_business_expenses_status AS ENUM (
    'PENDING',
    'APPROVED',
    'PAID',
    'REJECTED',
    'CANCELLED'
);


--
-- Name: enum_business_subscriptions_billingCycle; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_business_subscriptions_billingCycle" AS ENUM (
    'MONTHLY',
    'ANNUAL'
);


--
-- Name: enum_business_subscriptions_paymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_business_subscriptions_paymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


--
-- Name: enum_business_subscriptions_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_business_subscriptions_status AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'CANCELED',
    'SUSPENDED',
    'TRIAL',
    'PENDING',
    'OVERDUE'
);


--
-- Name: enum_businesses_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_businesses_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'TRIAL'
);


--
-- Name: enum_cash_register_shifts_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_cash_register_shifts_status AS ENUM (
    'OPEN',
    'CLOSED'
);


--
-- Name: enum_clients_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_clients_gender AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER',
    'PREFER_NOT_TO_SAY'
);


--
-- Name: enum_clients_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_clients_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'BLOCKED'
);


--
-- Name: enum_commission_details_paymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_commission_details_paymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'DISPUTED'
);


--
-- Name: enum_commission_payment_requests_paymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_commission_payment_requests_paymentMethod" AS ENUM (
    'BANK_TRANSFER',
    'CASH',
    'DIGITAL_WALLET',
    'CHECK',
    'OTHER'
);


--
-- Name: enum_commission_payment_requests_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_commission_payment_requests_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'PAID',
    'CANCELLED'
);


--
-- Name: enum_consent_signatures_signatureType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_consent_signatures_signatureType" AS ENUM (
    'DIGITAL',
    'UPLOADED',
    'TYPED'
);


--
-- Name: enum_consent_signatures_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_consent_signatures_status AS ENUM (
    'ACTIVE',
    'REVOKED',
    'EXPIRED'
);


--
-- Name: enum_financial_movements_paymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_financial_movements_paymentMethod" AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'DIGITAL_WALLET',
    'CHECK',
    'VOUCHER',
    'CREDIT'
);


--
-- Name: enum_financial_movements_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_financial_movements_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);


--
-- Name: enum_financial_movements_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_financial_movements_type AS ENUM (
    'INCOME',
    'EXPENSE'
);


--
-- Name: enum_inventory_movements_movementType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_inventory_movements_movementType" AS ENUM (
    'PURCHASE',
    'SALE',
    'ADJUSTMENT',
    'TRANSFER',
    'RETURN',
    'DAMAGE',
    'EXPIRED',
    'INITIAL_STOCK'
);


--
-- Name: enum_modules_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_modules_category AS ENUM (
    'CORE',
    'APPOINTMENTS',
    'PAYMENTS',
    'INVENTORY',
    'REPORTS',
    'INTEGRATIONS',
    'COMMUNICATIONS',
    'ANALYTICS'
);


--
-- Name: enum_modules_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_modules_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'DEVELOPMENT',
    'DEPRECATED'
);


--
-- Name: enum_owner_expenses_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_owner_expenses_category AS ENUM (
    'INFRASTRUCTURE',
    'MARKETING',
    'PERSONNEL',
    'OFFICE',
    'TECHNOLOGY',
    'LEGAL',
    'TRAVEL',
    'TRAINING',
    'MAINTENANCE',
    'UTILITIES',
    'INSURANCE',
    'TAXES',
    'OTHER'
);


--
-- Name: enum_owner_expenses_receiptType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_owner_expenses_receiptType" AS ENUM (
    'IMAGE',
    'PDF',
    'NONE'
);


--
-- Name: enum_owner_expenses_recurringFrequency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_owner_expenses_recurringFrequency" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
);


--
-- Name: enum_owner_expenses_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_owner_expenses_status AS ENUM (
    'DRAFT',
    'PENDING',
    'APPROVED',
    'REJECTED',
    'PAID'
);


--
-- Name: enum_owner_financial_reports_generatedBy; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_owner_financial_reports_generatedBy" AS ENUM (
    'AUTOMATIC',
    'MANUAL',
    'SCHEDULED'
);


--
-- Name: enum_owner_financial_reports_reportType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_owner_financial_reports_reportType" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY',
    'CUSTOM'
);


--
-- Name: enum_owner_financial_reports_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_owner_financial_reports_status AS ENUM (
    'GENERATING',
    'COMPLETED',
    'FAILED'
);


--
-- Name: enum_owner_payment_configurations_environment; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_owner_payment_configurations_environment AS ENUM (
    'SANDBOX',
    'PRODUCTION'
);


--
-- Name: enum_owner_payment_configurations_provider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_owner_payment_configurations_provider AS ENUM (
    'WOMPI',
    'TAXXA',
    'PAYPAL',
    'STRIPE',
    'MERCADOPAGO',
    'PSE',
    'BANK_TRANSFER',
    'MANUAL'
);


--
-- Name: enum_payment_integrations_environment; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_payment_integrations_environment AS ENUM (
    'SANDBOX',
    'PRODUCTION'
);


--
-- Name: enum_payment_integrations_provider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_payment_integrations_provider AS ENUM (
    'WOMPI',
    'TAXXA',
    'PAYPAL',
    'STRIPE',
    'MERCADOPAGO',
    'PSE'
);


--
-- Name: enum_payment_integrations_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_payment_integrations_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ERROR',
    'PENDING_VERIFICATION'
);


--
-- Name: enum_products_product_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_products_product_type AS ENUM (
    'FOR_SALE',
    'FOR_PROCEDURES',
    'BOTH'
);


--
-- Name: enum_rule_templates_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_rule_templates_category AS ENUM (
    'PAYMENT_POLICY',
    'CANCELLATION_POLICY',
    'BOOKING_POLICY',
    'WORKING_HOURS',
    'NOTIFICATION_POLICY',
    'REFUND_POLICY',
    'SERVICE_POLICY',
    'APPOINTMENT',
    'PAYMENT',
    'TIME',
    'GENERAL'
);


--
-- Name: enum_rule_templates_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_rule_templates_type AS ENUM (
    'BOOLEAN',
    'STRING',
    'NUMBER',
    'JSON',
    'CONFIGURATION'
);


--
-- Name: enum_service_commissions_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_service_commissions_type AS ENUM (
    'PERCENTAGE',
    'FIXED'
);


--
-- Name: enum_services_packageType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_services_packageType" AS ENUM (
    'SINGLE',
    'MULTI_SESSION',
    'WITH_MAINTENANCE'
);


--
-- Name: enum_specialist_branch_schedules_dayOfWeek; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_specialist_branch_schedules_dayOfWeek" AS ENUM (
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
);


--
-- Name: enum_specialist_commissions_commissionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_specialist_commissions_commissionType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


--
-- Name: enum_specialist_commissions_paymentFrequency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_specialist_commissions_paymentFrequency" AS ENUM (
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'ON_DEMAND'
);


--
-- Name: enum_specialist_documents_documentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_specialist_documents_documentType" AS ENUM (
    'ID_CARD',
    'PROFESSIONAL_CERT',
    'SIGNATURE',
    'BANK_INFO',
    'CONTRACT',
    'OTHER'
);


--
-- Name: enum_specialist_documents_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_specialist_documents_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: enum_specialist_profiles_commissionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_specialist_profiles_commissionType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


--
-- Name: enum_specialist_profiles_contractType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_specialist_profiles_contractType" AS ENUM (
    'EMPLOYEE',
    'CONTRACTOR',
    'PARTNER'
);


--
-- Name: enum_specialist_profiles_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_specialist_profiles_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ON_VACATION',
    'SICK_LEAVE',
    'SUSPENDED'
);


--
-- Name: enum_specialist_services_skillLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_specialist_services_skillLevel" AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED',
    'EXPERT'
);


--
-- Name: enum_subscription_payments_currentStep; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_subscription_payments_currentStep" AS ENUM (
    'SUPPORTED_VERSION',
    'AUTHENTICATION',
    'CHALLENGE'
);


--
-- Name: enum_subscription_payments_currentStepStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_subscription_payments_currentStepStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'Non-Authenticated',
    'ERROR'
);


--
-- Name: enum_subscription_payments_paymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_subscription_payments_paymentMethod" AS ENUM (
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'PSE',
    'CASH',
    'CHECK',
    'DIGITAL_WALLET',
    'MANUAL',
    'WOMPI_CARD',
    'WOMPI_3DS',
    'WOMPI_3RI'
);


--
-- Name: enum_subscription_payments_recurringType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_subscription_payments_recurringType" AS ENUM (
    'INITIAL',
    'RECURRING',
    'MANUAL'
);


--
-- Name: enum_subscription_payments_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_subscription_payments_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'ATTEMPT_FAILED',
    'PAYMENT_INCOMPLETE',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'APPROVED',
    'DECLINED',
    'ERROR',
    'VOIDED',
    'THREEDS_PENDING',
    'THREEDS_CHALLENGE',
    'THREEDS_COMPLETED'
);


--
-- Name: enum_subscription_payments_threeDsAuthType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_subscription_payments_threeDsAuthType" AS ENUM (
    'no_challenge_success',
    'challenge_denied',
    'challenge_v2',
    'supported_version_error',
    'authentication_error'
);


--
-- Name: enum_subscription_plans_billingCycle; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_subscription_plans_billingCycle" AS ENUM (
    'MONTHLY',
    'ANNUAL'
);


--
-- Name: enum_subscription_plans_durationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_subscription_plans_durationType" AS ENUM (
    'DAYS',
    'WEEKS',
    'MONTHS',
    'YEARS'
);


--
-- Name: enum_subscription_plans_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_subscription_plans_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'DEPRECATED'
);


--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_role AS ENUM (
    'OWNER',
    'BUSINESS',
    'SPECIALIST',
    'RECEPTIONIST',
    'CLIENT',
    'RECEPTIONIST_SPECIALIST',
    'BUSINESS_SPECIALIST'
);


--
-- Name: enum_users_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "branchId" uuid,
    "clientId" uuid NOT NULL,
    "specialistId" uuid NOT NULL,
    "serviceId" uuid NOT NULL,
    "appointmentNumber" character varying(255),
    "startTime" timestamp with time zone NOT NULL,
    "endTime" timestamp with time zone NOT NULL,
    status public.enum_appointments_status DEFAULT 'PENDING'::public.enum_appointments_status NOT NULL,
    "paymentStatus" public."enum_appointments_paymentStatus" DEFAULT 'PENDING'::public."enum_appointments_paymentStatus" NOT NULL,
    "totalAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "paidAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "discountAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    "clientNotes" text,
    "specialistNotes" text,
    "cancelReason" text,
    "canceledAt" timestamp with time zone,
    "canceledBy" uuid,
    "confirmedAt" timestamp with time zone,
    "startedAt" timestamp with time zone,
    "completedAt" timestamp with time zone,
    "hasConsent" boolean DEFAULT false NOT NULL,
    "consentSignedAt" timestamp with time zone,
    "consentDocument" character varying(255),
    evidence jsonb DEFAULT '{"after": [], "before": [], "documents": []}'::jsonb,
    rating integer,
    feedback text,
    "remindersSent" jsonb DEFAULT '[]'::jsonb,
    "isOnline" boolean DEFAULT false NOT NULL,
    "meetingLink" character varying(255),
    "rescheduleHistory" jsonb DEFAULT '[]'::jsonb,
    "additionalServices" jsonb DEFAULT '[]'::jsonb,
    "advancePayment" jsonb,
    "wompiPaymentReference" character varying(255),
    "depositStatus" character varying(255) DEFAULT 'NOT_REQUIRED'::character varying NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN appointments."branchId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments."branchId" IS 'Sucursal donde se realiza la cita';


--
-- Name: COLUMN appointments."advancePayment"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments."advancePayment" IS 'Información del pago adelantado requerido para la cita';


--
-- Name: COLUMN appointments."wompiPaymentReference"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments."wompiPaymentReference" IS 'Referencia única del pago adelantado en Wompi';


--
-- Name: COLUMN appointments."depositStatus"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments."depositStatus" IS 'Estado del depósito requerido para agendar la cita';


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    description text,
    address character varying(255),
    city character varying(255),
    state character varying(255),
    country character varying(255) DEFAULT 'Colombia'::character varying NOT NULL,
    "zipCode" character varying(255),
    phone character varying(255),
    email character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8),
    timezone character varying(255) DEFAULT 'America/Bogota'::character varying NOT NULL,
    "isMain" boolean DEFAULT false NOT NULL,
    status public.enum_branches_status DEFAULT 'ACTIVE'::public.enum_branches_status NOT NULL,
    "businessHours" jsonb DEFAULT '{"friday": {"open": "09:00", "close": "18:00", "closed": false}, "monday": {"open": "09:00", "close": "18:00", "closed": false}, "sunday": {"open": null, "close": null, "closed": true}, "tuesday": {"open": "09:00", "close": "18:00", "closed": false}, "saturday": {"open": "09:00", "close": "14:00", "closed": false}, "thursday": {"open": "09:00", "close": "18:00", "closed": false}, "wednesday": {"open": "09:00", "close": "18:00", "closed": false}}'::jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN branches."isMain"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.branches."isMain" IS 'Indica si esta es la sucursal principal del negocio';


--
-- Name: COLUMN branches."businessHours"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.branches."businessHours" IS 'Horarios de atención por día de la semana';


--
-- Name: COLUMN branches.settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.branches.settings IS 'Configuraciones específicas de la sucursal';


--
-- Name: business_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_clients (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "clientId" uuid NOT NULL,
    "clientNumber" character varying(255),
    status public.enum_business_clients_status DEFAULT 'ACTIVE'::public.enum_business_clients_status NOT NULL,
    "firstVisit" timestamp with time zone,
    "lastVisit" timestamp with time zone,
    "totalVisits" integer DEFAULT 0 NOT NULL,
    "totalSpent" numeric(10,2) DEFAULT 0 NOT NULL,
    "averageRating" numeric(3,2),
    "preferredSpecialistId" uuid,
    "businessNotes" text,
    "businessTags" jsonb DEFAULT '[]'::jsonb,
    "loyaltyPoints" integer DEFAULT 0 NOT NULL,
    "discountEligible" boolean DEFAULT false NOT NULL,
    "hasOutstandingBalance" boolean DEFAULT false NOT NULL,
    "outstandingAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "hasPendingCancellation" boolean DEFAULT false NOT NULL,
    "customFields" jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: business_commission_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_commission_configs (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "commissionsEnabled" boolean DEFAULT true NOT NULL,
    "calculationType" public."enum_business_commission_configs_calculationType" DEFAULT 'POR_SERVICIO'::public."enum_business_commission_configs_calculationType" NOT NULL,
    "generalPercentage" numeric(5,2) DEFAULT 50,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN business_commission_configs."businessId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_commission_configs."businessId" IS 'Negocio al que pertenece esta configuración';


--
-- Name: COLUMN business_commission_configs."commissionsEnabled"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_commission_configs."commissionsEnabled" IS '¿El negocio maneja comisiones para especialistas?';


--
-- Name: COLUMN business_commission_configs."generalPercentage"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_commission_configs."generalPercentage" IS 'Porcentaje general de comisión para especialistas (usado en GENERAL o MIXTO)';


--
-- Name: COLUMN business_commission_configs.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_commission_configs.notes IS 'Notas adicionales sobre la configuración de comisiones';


--
-- Name: business_expense_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_expense_categories (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    color character varying(7) DEFAULT '#6B7280'::character varying,
    icon character varying(50),
    "requiresReceipt" boolean DEFAULT false NOT NULL,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "defaultAmount" numeric(10,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN business_expense_categories."businessId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories."businessId" IS 'Negocio al que pertenece la categoría';


--
-- Name: COLUMN business_expense_categories.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories.name IS 'Nombre de la categoría (ej: Arriendos, Servicios públicos, Nómina)';


--
-- Name: COLUMN business_expense_categories.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories.description IS 'Descripción de la categoría';


--
-- Name: COLUMN business_expense_categories.color; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories.color IS 'Color hex para identificar la categoría en gráficos';


--
-- Name: COLUMN business_expense_categories.icon; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories.icon IS 'Nombre del ícono (heroicons, material-icons, etc.)';


--
-- Name: COLUMN business_expense_categories."requiresReceipt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories."requiresReceipt" IS 'Si es true, los gastos de esta categoría requieren comprobante obligatorio';


--
-- Name: COLUMN business_expense_categories."isRecurring"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories."isRecurring" IS 'Indica si los gastos de esta categoría suelen ser recurrentes';


--
-- Name: COLUMN business_expense_categories."defaultAmount"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories."defaultAmount" IS 'Monto por defecto para gastos recurrentes (opcional)';


--
-- Name: COLUMN business_expense_categories."isActive"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories."isActive" IS 'Categoría activa/inactiva';


--
-- Name: COLUMN business_expense_categories."sortOrder"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories."sortOrder" IS 'Orden de visualización';


--
-- Name: COLUMN business_expense_categories."createdBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories."createdBy" IS 'Usuario que creó la categoría';


--
-- Name: COLUMN business_expense_categories."updatedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expense_categories."updatedBy" IS 'Usuario que actualizó la categoría';


--
-- Name: business_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_expenses (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "categoryId" uuid NOT NULL,
    description character varying(500) NOT NULL,
    amount numeric(15,2) NOT NULL,
    currency character varying(3) DEFAULT 'COP'::character varying NOT NULL,
    "expenseDate" timestamp with time zone NOT NULL,
    "dueDate" timestamp with time zone,
    "paidDate" timestamp with time zone,
    vendor character varying(200),
    "vendorTaxId" character varying(50),
    "vendorPhone" character varying(20),
    "vendorEmail" character varying(100),
    "receiptUrl" character varying(500),
    "receiptPublicId" character varying(200),
    "receiptType" public."enum_business_expenses_receiptType",
    "receiptOriginalName" character varying(255),
    "taxAmount" numeric(15,2) DEFAULT 0 NOT NULL,
    "taxRate" numeric(5,2) DEFAULT 0 NOT NULL,
    "paymentMethod" public."enum_business_expenses_paymentMethod",
    "transactionReference" character varying(100),
    status public.enum_business_expenses_status DEFAULT 'PENDING'::public.enum_business_expenses_status NOT NULL,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurringFrequency" public."enum_business_expenses_recurringFrequency",
    "nextRecurrenceDate" timestamp with time zone,
    notes text,
    "internalReference" character varying(50),
    "approvedBy" uuid,
    "approvedAt" timestamp with time zone,
    "rejectionReason" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN business_expenses."businessId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."businessId" IS 'Negocio al que pertenece el gasto';


--
-- Name: COLUMN business_expenses."categoryId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."categoryId" IS 'Categoría personalizada del gasto';


--
-- Name: COLUMN business_expenses.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses.description IS 'Descripción detallada del gasto';


--
-- Name: COLUMN business_expenses.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses.amount IS 'Monto del gasto';


--
-- Name: COLUMN business_expenses.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses.currency IS 'Moneda (ISO 4217)';


--
-- Name: COLUMN business_expenses."expenseDate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."expenseDate" IS 'Fecha en que se realizó el gasto';


--
-- Name: COLUMN business_expenses."dueDate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."dueDate" IS 'Fecha de vencimiento del pago (si aplica)';


--
-- Name: COLUMN business_expenses."paidDate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."paidDate" IS 'Fecha en que se pagó el gasto';


--
-- Name: COLUMN business_expenses.vendor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses.vendor IS 'Nombre del proveedor';


--
-- Name: COLUMN business_expenses."vendorTaxId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."vendorTaxId" IS 'NIT o identificación tributaria';


--
-- Name: COLUMN business_expenses."vendorPhone"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."vendorPhone" IS 'Teléfono del proveedor';


--
-- Name: COLUMN business_expenses."vendorEmail"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."vendorEmail" IS 'Email del proveedor';


--
-- Name: COLUMN business_expenses."receiptUrl"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."receiptUrl" IS 'URL del comprobante en Cloudinary';


--
-- Name: COLUMN business_expenses."receiptPublicId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."receiptPublicId" IS 'Public ID de Cloudinary';


--
-- Name: COLUMN business_expenses."receiptOriginalName"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."receiptOriginalName" IS 'Nombre original del archivo';


--
-- Name: COLUMN business_expenses."taxAmount"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."taxAmount" IS 'Monto de impuestos (IVA, retención, etc.)';


--
-- Name: COLUMN business_expenses."taxRate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."taxRate" IS 'Porcentaje de impuesto aplicado';


--
-- Name: COLUMN business_expenses."transactionReference"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."transactionReference" IS 'Referencia o número de transacción';


--
-- Name: COLUMN business_expenses."isRecurring"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."isRecurring" IS 'Indica si es un gasto recurrente';


--
-- Name: COLUMN business_expenses.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses.notes IS 'Notas adicionales sobre el gasto';


--
-- Name: COLUMN business_expenses."internalReference"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."internalReference" IS 'Referencia interna del negocio';


--
-- Name: COLUMN business_expenses."approvedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."approvedBy" IS 'Usuario que aprobó el gasto';


--
-- Name: COLUMN business_expenses."approvedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."approvedAt" IS 'Fecha de aprobación';


--
-- Name: COLUMN business_expenses."rejectionReason"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."rejectionReason" IS 'Motivo de rechazo (si aplica)';


--
-- Name: COLUMN business_expenses."isActive"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."isActive" IS 'Gasto activo/eliminado';


--
-- Name: COLUMN business_expenses."createdBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."createdBy" IS 'Usuario que registró el gasto';


--
-- Name: COLUMN business_expenses."updatedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_expenses."updatedBy" IS 'Usuario que actualizó el gasto';


--
-- Name: business_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_rules (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "ruleTemplateId" uuid NOT NULL,
    "customValue" jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "updatedBy" uuid,
    notes text,
    "appliedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN business_rules."businessId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules."businessId" IS 'ID del negocio que usa esta regla';


--
-- Name: COLUMN business_rules."ruleTemplateId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules."ruleTemplateId" IS 'ID del template de regla';


--
-- Name: COLUMN business_rules."customValue"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules."customValue" IS 'Valor personalizado del negocio. Si es NULL, usar defaultValue del template';


--
-- Name: COLUMN business_rules."isActive"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules."isActive" IS 'Si esta regla está activa para el negocio';


--
-- Name: COLUMN business_rules."updatedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules."updatedBy" IS 'Usuario que realizó la última modificación';


--
-- Name: COLUMN business_rules.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules.notes IS 'Notas adicionales sobre la configuración de esta regla';


--
-- Name: COLUMN business_rules."appliedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules."appliedAt" IS 'Fecha cuando se aplicó por primera vez esta regla';


--
-- Name: business_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_subscriptions (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "subscriptionPlanId" uuid NOT NULL,
    status public.enum_business_subscriptions_status DEFAULT 'TRIAL'::public.enum_business_subscriptions_status NOT NULL,
    "startDate" timestamp with time zone NOT NULL,
    "endDate" timestamp with time zone NOT NULL,
    "trialEndDate" timestamp with time zone,
    "autoRenew" boolean DEFAULT true NOT NULL,
    "paymentMethod" character varying(255),
    "paymentStatus" public."enum_business_subscriptions_paymentStatus" DEFAULT 'PENDING'::public."enum_business_subscriptions_paymentStatus" NOT NULL,
    "lastPaymentDate" timestamp with time zone,
    "nextPaymentDate" timestamp with time zone,
    amount numeric(10,2) NOT NULL,
    currency character varying(255) DEFAULT 'COP'::character varying NOT NULL,
    "billingCycle" public."enum_business_subscriptions_billingCycle" DEFAULT 'MONTHLY'::public."enum_business_subscriptions_billingCycle" NOT NULL,
    "discountApplied" numeric(5,2) DEFAULT 0 NOT NULL,
    notes text,
    "canceledAt" timestamp with time zone,
    "cancelReason" text,
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.businesses (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    logo character varying(255),
    email character varying(255) NOT NULL,
    phone character varying(255),
    address character varying(255),
    city character varying(255),
    state character varying(255),
    country character varying(255),
    "zipCode" character varying(255),
    "taxId" character varying(255),
    website character varying(255),
    subdomain character varying(255),
    status public.enum_businesses_status DEFAULT 'TRIAL'::public.enum_businesses_status NOT NULL,
    timezone character varying(255) DEFAULT 'America/Bogota'::character varying NOT NULL,
    currency character varying(255) DEFAULT 'COP'::character varying NOT NULL,
    language character varying(255) DEFAULT 'es'::character varying NOT NULL,
    "subscriptionStartDate" timestamp with time zone,
    "subscriptionEndDate" timestamp with time zone,
    "trialEndDate" timestamp with time zone,
    "dataRetentionUntil" timestamp with time zone,
    "currentPlanId" uuid,
    settings jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN businesses."dataRetentionUntil"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.businesses."dataRetentionUntil" IS 'Fecha hasta la cual se mantendrán los datos del negocio después de la expiración de suscripción (30 días después del último vencimiento)';


--
-- Name: cash_register_shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_register_shifts (
    id uuid NOT NULL,
    business_id uuid NOT NULL,
    user_id uuid NOT NULL,
    branch_id uuid,
    shift_number integer NOT NULL,
    status public.enum_cash_register_shifts_status DEFAULT 'OPEN'::public.enum_cash_register_shifts_status NOT NULL,
    opened_at timestamp with time zone NOT NULL,
    closed_at timestamp with time zone,
    opening_balance numeric(10,2) DEFAULT 0 NOT NULL,
    expected_closing_balance numeric(10,2),
    actual_closing_balance numeric(10,2),
    difference numeric(10,2),
    summary jsonb DEFAULT '{}'::jsonb,
    opening_notes text,
    closing_notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN cash_register_shifts.business_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.business_id IS 'Negocio al que pertenece el turno';


--
-- Name: COLUMN cash_register_shifts.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.user_id IS 'Usuario que abre/cierra el turno';


--
-- Name: COLUMN cash_register_shifts.branch_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.branch_id IS 'Sucursal donde se realiza el turno';


--
-- Name: COLUMN cash_register_shifts.shift_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.shift_number IS 'Número secuencial del turno en el día';


--
-- Name: COLUMN cash_register_shifts.opening_balance; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.opening_balance IS 'Dinero inicial recibido de caja anterior';


--
-- Name: COLUMN cash_register_shifts.expected_closing_balance; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.expected_closing_balance IS 'Balance esperado según transacciones';


--
-- Name: COLUMN cash_register_shifts.actual_closing_balance; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.actual_closing_balance IS 'Balance real declarado al cerrar';


--
-- Name: COLUMN cash_register_shifts.difference; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.difference IS 'Diferencia entre esperado y real (faltante o sobrante)';


--
-- Name: COLUMN cash_register_shifts.summary; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.summary IS 'Resumen del turno: { appointments: {}, products: {}, paymentMethods: {} }';


--
-- Name: COLUMN cash_register_shifts.opening_notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.opening_notes IS 'Notas al abrir el turno';


--
-- Name: COLUMN cash_register_shifts.closing_notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.closing_notes IS 'Notas al cerrar el turno (explicación de diferencias)';


--
-- Name: COLUMN cash_register_shifts.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cash_register_shifts.metadata IS 'Datos adicionales del turno';


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid NOT NULL,
    business_id uuid,
    email character varying(255) NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    phone character varying(255),
    "phoneSecondary" character varying(255),
    "dateOfBirth" date,
    gender public.enum_clients_gender,
    address character varying(255),
    city character varying(255),
    state character varying(255),
    "zipCode" character varying(255),
    "emergencyContact" jsonb DEFAULT '{}'::jsonb,
    "medicalInfo" jsonb DEFAULT '{"notes": "", "allergies": [], "conditions": [], "medications": []}'::jsonb,
    avatar character varying(255),
    status public.enum_clients_status DEFAULT 'ACTIVE'::public.enum_clients_status NOT NULL,
    preferences jsonb DEFAULT '{"language": "es", "timezone": "America/Bogota", "notifications": {"sms": false, "email": true, "whatsapp": false}}'::jsonb,
    tags jsonb DEFAULT '[]'::jsonb,
    notes text,
    source character varying(255),
    "lastAppointment" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: commission_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.commission_details (
    id uuid NOT NULL,
    "paymentRequestId" uuid NOT NULL,
    "appointmentId" uuid NOT NULL,
    "serviceId" uuid NOT NULL,
    "clientId" uuid NOT NULL,
    "serviceDate" timestamp with time zone NOT NULL,
    "serviceName" character varying(255) NOT NULL,
    "servicePrice" numeric(10,2) NOT NULL,
    "commissionRate" numeric(5,2) NOT NULL,
    "commissionAmount" numeric(10,2) NOT NULL,
    currency character varying(255) DEFAULT 'COP'::character varying NOT NULL,
    "clientName" character varying(255) NOT NULL,
    "paymentStatus" public."enum_commission_details_paymentStatus" DEFAULT 'PENDING'::public."enum_commission_details_paymentStatus" NOT NULL,
    notes text,
    "isDisputed" boolean DEFAULT false NOT NULL,
    "disputeReason" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: commission_payment_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.commission_payment_requests (
    id uuid NOT NULL,
    "requestNumber" character varying(255) NOT NULL,
    "specialistId" uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "periodFrom" timestamp with time zone NOT NULL,
    "periodTo" timestamp with time zone NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    currency character varying(255) DEFAULT 'COP'::character varying NOT NULL,
    status public.enum_commission_payment_requests_status DEFAULT 'DRAFT'::public.enum_commission_payment_requests_status NOT NULL,
    "documentUrl" character varying(255),
    "signatureUrl" character varying(255),
    "specialistNotes" text,
    "businessNotes" text,
    "rejectionReason" text,
    "submittedAt" timestamp with time zone,
    "reviewedAt" timestamp with time zone,
    "reviewedBy" uuid,
    "paidAt" timestamp with time zone,
    "paidBy" uuid,
    "paymentMethod" public."enum_commission_payment_requests_paymentMethod",
    "paymentReference" character varying(255),
    "bankAccount" json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: consent_signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consent_signatures (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "consentTemplateId" uuid NOT NULL,
    "customerId" uuid NOT NULL,
    "appointmentId" uuid,
    "serviceId" uuid,
    "templateVersion" character varying(20) NOT NULL,
    "templateContent" text NOT NULL,
    "signatureData" text,
    "signatureType" public."enum_consent_signatures_signatureType" DEFAULT 'DIGITAL'::public."enum_consent_signatures_signatureType" NOT NULL,
    "signedAt" timestamp with time zone NOT NULL,
    "signedBy" character varying(255) NOT NULL,
    "editableFieldsData" jsonb DEFAULT '{}'::jsonb,
    "pdfUrl" character varying(255),
    "pdfGeneratedAt" timestamp with time zone,
    "ipAddress" character varying(45),
    "userAgent" text,
    location jsonb,
    device jsonb DEFAULT '{}'::jsonb,
    status public.enum_consent_signatures_status DEFAULT 'ACTIVE'::public.enum_consent_signatures_status NOT NULL,
    "revokedAt" timestamp with time zone,
    "revokedReason" text,
    "revokedBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN consent_signatures."businessId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."businessId" IS 'Negocio al que pertenece esta firma';


--
-- Name: COLUMN consent_signatures."consentTemplateId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."consentTemplateId" IS 'Template que fue firmado (RESTRICT para mantener historial)';


--
-- Name: COLUMN consent_signatures."customerId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."customerId" IS 'Cliente que firmó el consentimiento';


--
-- Name: COLUMN consent_signatures."appointmentId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."appointmentId" IS 'Cita asociada a esta firma (opcional)';


--
-- Name: COLUMN consent_signatures."serviceId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."serviceId" IS 'Servicio asociado a esta firma';


--
-- Name: COLUMN consent_signatures."templateVersion"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."templateVersion" IS 'Versión del template cuando fue firmado';


--
-- Name: COLUMN consent_signatures."templateContent"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."templateContent" IS 'Copia exacta del contenido que firmó el cliente (snapshot para trazabilidad legal)';


--
-- Name: COLUMN consent_signatures."signatureData"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."signatureData" IS 'Firma digital en base64 o path a imagen de la firma';


--
-- Name: COLUMN consent_signatures."signedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."signedAt" IS 'Fecha y hora exacta de la firma';


--
-- Name: COLUMN consent_signatures."signedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."signedBy" IS 'Nombre completo de quien firmó (puede diferir del nombre del cliente, ej: tutor legal)';


--
-- Name: COLUMN consent_signatures."editableFieldsData"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."editableFieldsData" IS 'Valores de campos editables completados por el cliente: {"alergias": "Penicilina", "medicamentos": "Ibuprofeno 400mg", "condiciones_medicas": "Hipertensión"}';


--
-- Name: COLUMN consent_signatures."pdfUrl"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."pdfUrl" IS 'URL o path del PDF firmado almacenado (en S3 o local storage)';


--
-- Name: COLUMN consent_signatures."pdfGeneratedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."pdfGeneratedAt" IS 'Fecha cuando se generó el PDF';


--
-- Name: COLUMN consent_signatures."ipAddress"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."ipAddress" IS 'Dirección IP desde donde se firmó (IPv4 o IPv6)';


--
-- Name: COLUMN consent_signatures."userAgent"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."userAgent" IS 'User agent del navegador/dispositivo usado para firmar';


--
-- Name: COLUMN consent_signatures.location; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures.location IS 'Coordenadas GPS si están disponibles { lat, lng, accuracy }';


--
-- Name: COLUMN consent_signatures.device; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures.device IS 'Información del dispositivo (tipo, modelo, SO, etc.)';


--
-- Name: COLUMN consent_signatures."revokedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."revokedAt" IS 'Fecha cuando se revocó la firma (si aplica)';


--
-- Name: COLUMN consent_signatures."revokedReason"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."revokedReason" IS 'Razón por la que se revocó la firma';


--
-- Name: COLUMN consent_signatures."revokedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_signatures."revokedBy" IS 'Usuario que revocó la firma';


--
-- Name: consent_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consent_templates (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    content text NOT NULL,
    version character varying(20) DEFAULT '1.0.0'::character varying NOT NULL,
    "editableFields" jsonb DEFAULT '[]'::jsonb,
    "pdfConfig" jsonb DEFAULT '{"margins": {"top": 50, "left": 50, "right": 50, "bottom": 50}, "fontSize": 12, "fontFamily": "Arial", "includeDate": true, "includeLogo": true, "includeBusinessName": true}'::jsonb,
    category character varying(50),
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN consent_templates."businessId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_templates."businessId" IS 'Negocio al que pertenece este template';


--
-- Name: COLUMN consent_templates.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_templates.name IS 'Nombre del template (ej: "Consentimiento Botox")';


--
-- Name: COLUMN consent_templates.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_templates.code IS 'Código único del template (ej: "CONSENT_BOTOX_V1")';


--
-- Name: COLUMN consent_templates.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_templates.content IS 'HTML del consentimiento con placeholders automáticos: {{negocio_nombre}}, {{cliente_nombre}}, {{fecha_firma}}, etc.';


--
-- Name: COLUMN consent_templates.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_templates.version IS 'Versión del template para control de cambios';


--
-- Name: COLUMN consent_templates."editableFields"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_templates."editableFields" IS 'Campos que el cliente debe completar al firmar: [{"name": "alergias", "label": "Alergias", "type": "textarea", "required": true}, {"name": "medicamentos", "label": "Medicamentos Actuales", "type": "textarea", "required": false}]';


--
-- Name: COLUMN consent_templates."pdfConfig"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_templates."pdfConfig" IS 'Configuración de cómo se genera el PDF';


--
-- Name: COLUMN consent_templates.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_templates.category IS 'Categoría del consentimiento (ej: ESTETICO, MEDICO, DEPILACION, TATUAJE)';


--
-- Name: COLUMN consent_templates."isActive"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_templates."isActive" IS 'Si este template está activo y puede ser usado';


--
-- Name: COLUMN consent_templates.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.consent_templates.metadata IS 'Metadatos adicionales (ej: idioma, autor, notas internas)';


--
-- Name: financial_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_movements (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    type public.enum_financial_movements_type NOT NULL,
    category character varying(100),
    "businessExpenseCategoryId" uuid,
    "businessExpenseId" uuid,
    amount numeric(10,2) NOT NULL,
    currency character varying(255) DEFAULT 'COP'::character varying NOT NULL,
    description character varying(255) NOT NULL,
    notes text,
    "paymentMethod" public."enum_financial_movements_paymentMethod" NOT NULL,
    "transactionId" character varying(255),
    "referenceId" uuid,
    "referenceType" character varying(255),
    "clientId" uuid,
    status public.enum_financial_movements_status DEFAULT 'COMPLETED'::public.enum_financial_movements_status NOT NULL,
    "dueDate" timestamp with time zone,
    "paidDate" timestamp with time zone,
    "receiptUrl" character varying(255),
    "voucherUrl" character varying(255),
    "taxAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "taxRate" numeric(5,2) DEFAULT 0 NOT NULL,
    commission jsonb DEFAULT '{"rate": 0, "businessAmount": 0, "specialistAmount": 0}'::jsonb,
    "integrationData" jsonb DEFAULT '{}'::jsonb,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurringConfig" jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_movements (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "movementType" public."enum_inventory_movements_movementType" NOT NULL,
    quantity integer NOT NULL,
    "unitCost" numeric(10,2),
    "totalCost" numeric(10,2),
    "previousStock" integer NOT NULL,
    "newStock" integer NOT NULL,
    reason character varying(255),
    notes text,
    "referenceId" uuid,
    "referenceType" character varying(255),
    "batchNumber" character varying(255),
    "expirationDate" date,
    "supplierInfo" jsonb DEFAULT '{}'::jsonb,
    "documentUrl" character varying(255),
    branch_id uuid,
    specialist_id uuid,
    appointment_id uuid,
    from_branch_id uuid,
    to_branch_id uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN inventory_movements.branch_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_movements.branch_id IS 'Sucursal donde ocurre el movimiento';


--
-- Name: COLUMN inventory_movements.specialist_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_movements.specialist_id IS 'Especialista que retira el producto (para procedimientos)';


--
-- Name: COLUMN inventory_movements.appointment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_movements.appointment_id IS 'Cita asociada al movimiento';


--
-- Name: COLUMN inventory_movements.from_branch_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_movements.from_branch_id IS 'Sucursal de origen en transferencias';


--
-- Name: COLUMN inventory_movements.to_branch_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_movements.to_branch_id IS 'Sucursal de destino en transferencias';


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    "displayName" character varying(255) NOT NULL,
    description text,
    icon character varying(255),
    category public.enum_modules_category DEFAULT 'CORE'::public.enum_modules_category NOT NULL,
    status public.enum_modules_status DEFAULT 'ACTIVE'::public.enum_modules_status NOT NULL,
    version character varying(255) DEFAULT '1.0.0'::character varying NOT NULL,
    "requiresConfiguration" boolean DEFAULT false NOT NULL,
    "configurationSchema" jsonb,
    permissions jsonb DEFAULT '[]'::jsonb,
    dependencies jsonb DEFAULT '[]'::jsonb,
    pricing jsonb DEFAULT '{"type": "FREE", "price": 0, "currency": "COP"}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: owner_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.owner_expenses (
    id uuid NOT NULL,
    description character varying(500) NOT NULL,
    amount numeric(15,2) NOT NULL,
    currency character varying(3) DEFAULT 'COP'::character varying NOT NULL,
    category public.enum_owner_expenses_category NOT NULL,
    subcategory character varying(100),
    "expenseDate" timestamp with time zone NOT NULL,
    "dueDate" timestamp with time zone,
    vendor character varying(200),
    "vendorTaxId" character varying(50),
    "vendorEmail" character varying(100),
    "receiptUrl" character varying(500),
    "receiptPublicId" character varying(200),
    "receiptType" public."enum_owner_expenses_receiptType" DEFAULT 'NONE'::public."enum_owner_expenses_receiptType",
    "receiptOriginalName" character varying(255),
    status public.enum_owner_expenses_status DEFAULT 'PENDING'::public.enum_owner_expenses_status,
    "approvedBy" uuid,
    "approvedAt" timestamp with time zone,
    "rejectionReason" text,
    "taxAmount" numeric(15,2) DEFAULT 0,
    "taxRate" numeric(5,2) DEFAULT 0,
    "isRecurring" boolean DEFAULT false,
    "recurringFrequency" public."enum_owner_expenses_recurringFrequency",
    notes text,
    "internalReference" character varying(100),
    "projectCode" character varying(50),
    "isActive" boolean DEFAULT true,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN owner_expenses.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses.description IS 'Descripción detallada del gasto';


--
-- Name: COLUMN owner_expenses.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses.amount IS 'Monto del gasto';


--
-- Name: COLUMN owner_expenses.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses.currency IS 'Moneda del gasto (ISO 4217)';


--
-- Name: COLUMN owner_expenses.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses.category IS 'Categoría del gasto';


--
-- Name: COLUMN owner_expenses.subcategory; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses.subcategory IS 'Subcategoría específica del gasto';


--
-- Name: COLUMN owner_expenses."expenseDate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."expenseDate" IS 'Fecha en que se realizó el gasto';


--
-- Name: COLUMN owner_expenses."dueDate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."dueDate" IS 'Fecha de vencimiento del pago (si aplica)';


--
-- Name: COLUMN owner_expenses.vendor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses.vendor IS 'Nombre del proveedor o empresa';


--
-- Name: COLUMN owner_expenses."vendorTaxId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."vendorTaxId" IS 'NIT o identificación tributaria del proveedor';


--
-- Name: COLUMN owner_expenses."vendorEmail"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."vendorEmail" IS 'Email del proveedor';


--
-- Name: COLUMN owner_expenses."receiptUrl"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."receiptUrl" IS 'URL del comprobante en Cloudinary';


--
-- Name: COLUMN owner_expenses."receiptPublicId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."receiptPublicId" IS 'Public ID de Cloudinary para gestionar el archivo';


--
-- Name: COLUMN owner_expenses."receiptType"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."receiptType" IS 'Tipo de comprobante subido';


--
-- Name: COLUMN owner_expenses."receiptOriginalName"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."receiptOriginalName" IS 'Nombre original del archivo subido';


--
-- Name: COLUMN owner_expenses.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses.status IS 'Estado del gasto';


--
-- Name: COLUMN owner_expenses."approvedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."approvedBy" IS 'ID del usuario que aprobó el gasto';


--
-- Name: COLUMN owner_expenses."approvedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."approvedAt" IS 'Fecha de aprobación';


--
-- Name: COLUMN owner_expenses."rejectionReason"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."rejectionReason" IS 'Razón del rechazo (si aplica)';


--
-- Name: COLUMN owner_expenses."taxAmount"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."taxAmount" IS 'Monto de impuestos incluidos';


--
-- Name: COLUMN owner_expenses."taxRate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."taxRate" IS 'Tasa de impuesto aplicada (%)';


--
-- Name: COLUMN owner_expenses."isRecurring"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."isRecurring" IS 'Indica si es un gasto recurrente';


--
-- Name: COLUMN owner_expenses."recurringFrequency"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."recurringFrequency" IS 'Frecuencia del gasto recurrente';


--
-- Name: COLUMN owner_expenses.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses.notes IS 'Notas adicionales sobre el gasto';


--
-- Name: COLUMN owner_expenses."internalReference"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."internalReference" IS 'Referencia interna o número de orden';


--
-- Name: COLUMN owner_expenses."projectCode"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."projectCode" IS 'Código de proyecto asociado (si aplica)';


--
-- Name: COLUMN owner_expenses."createdBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."createdBy" IS 'ID del usuario que creó el gasto';


--
-- Name: COLUMN owner_expenses."updatedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_expenses."updatedBy" IS 'ID del último usuario que modificó el gasto';


--
-- Name: owner_financial_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.owner_financial_reports (
    id uuid NOT NULL,
    "reportType" public."enum_owner_financial_reports_reportType" NOT NULL,
    "reportPeriod" character varying(255) NOT NULL,
    "startDate" timestamp with time zone NOT NULL,
    "endDate" timestamp with time zone NOT NULL,
    "totalRevenue" numeric(15,2) DEFAULT 0 NOT NULL,
    "subscriptionRevenue" numeric(15,2) DEFAULT 0 NOT NULL,
    "netRevenue" numeric(15,2) DEFAULT 0 NOT NULL,
    "totalPayments" integer DEFAULT 0 NOT NULL,
    "completedPayments" integer DEFAULT 0 NOT NULL,
    "failedPayments" integer DEFAULT 0 NOT NULL,
    "pendingPayments" integer DEFAULT 0 NOT NULL,
    "refundedPayments" integer DEFAULT 0 NOT NULL,
    "totalCommissions" numeric(10,2) DEFAULT 0 NOT NULL,
    "averageCommissionRate" numeric(5,2) DEFAULT 0 NOT NULL,
    "newSubscriptions" integer DEFAULT 0 NOT NULL,
    "renewedSubscriptions" integer DEFAULT 0 NOT NULL,
    "canceledSubscriptions" integer DEFAULT 0 NOT NULL,
    "activeSubscriptions" integer DEFAULT 0 NOT NULL,
    "revenueByPlan" jsonb DEFAULT '{}'::jsonb,
    "subscriptionsByPlan" jsonb DEFAULT '{}'::jsonb,
    "revenueByPaymentMethod" jsonb DEFAULT '{}'::jsonb,
    "paymentsByMethod" jsonb DEFAULT '{}'::jsonb,
    "averageRevenuePerBusiness" numeric(10,2) DEFAULT 0 NOT NULL,
    "churnRate" numeric(5,2) DEFAULT 0 NOT NULL,
    "retentionRate" numeric(5,2) DEFAULT 0 NOT NULL,
    "previousPeriodComparison" jsonb DEFAULT '{}'::jsonb,
    "yearOverYearGrowth" numeric(5,2),
    currency character varying(255) DEFAULT 'COP'::character varying NOT NULL,
    "generatedAt" timestamp with time zone NOT NULL,
    "generatedBy" public."enum_owner_financial_reports_generatedBy" DEFAULT 'AUTOMATIC'::public."enum_owner_financial_reports_generatedBy" NOT NULL,
    status public.enum_owner_financial_reports_status DEFAULT 'GENERATING'::public.enum_owner_financial_reports_status NOT NULL,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN owner_financial_reports."reportPeriod"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."reportPeriod" IS 'Período del reporte en formato YYYY-MM-DD o YYYY-MM o YYYY';


--
-- Name: COLUMN owner_financial_reports."totalRevenue"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."totalRevenue" IS 'Ingresos totales del período';


--
-- Name: COLUMN owner_financial_reports."subscriptionRevenue"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."subscriptionRevenue" IS 'Ingresos por suscripciones';


--
-- Name: COLUMN owner_financial_reports."netRevenue"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."netRevenue" IS 'Ingresos netos después de comisiones';


--
-- Name: COLUMN owner_financial_reports."totalPayments"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."totalPayments" IS 'Número total de pagos';


--
-- Name: COLUMN owner_financial_reports."completedPayments"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."completedPayments" IS 'Pagos completados exitosamente';


--
-- Name: COLUMN owner_financial_reports."failedPayments"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."failedPayments" IS 'Pagos fallidos';


--
-- Name: COLUMN owner_financial_reports."pendingPayments"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."pendingPayments" IS 'Pagos pendientes';


--
-- Name: COLUMN owner_financial_reports."refundedPayments"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."refundedPayments" IS 'Pagos reembolsados';


--
-- Name: COLUMN owner_financial_reports."totalCommissions"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."totalCommissions" IS 'Comisiones totales pagadas a proveedores';


--
-- Name: COLUMN owner_financial_reports."averageCommissionRate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."averageCommissionRate" IS 'Tasa promedio de comisión';


--
-- Name: COLUMN owner_financial_reports."newSubscriptions"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."newSubscriptions" IS 'Nuevas suscripciones en el período';


--
-- Name: COLUMN owner_financial_reports."renewedSubscriptions"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."renewedSubscriptions" IS 'Suscripciones renovadas';


--
-- Name: COLUMN owner_financial_reports."canceledSubscriptions"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."canceledSubscriptions" IS 'Suscripciones canceladas';


--
-- Name: COLUMN owner_financial_reports."activeSubscriptions"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."activeSubscriptions" IS 'Suscripciones activas al final del período';


--
-- Name: COLUMN owner_financial_reports."revenueByPlan"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."revenueByPlan" IS 'Ingresos desglosados por plan de suscripción';


--
-- Name: COLUMN owner_financial_reports."subscriptionsByPlan"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."subscriptionsByPlan" IS 'Cantidad de suscripciones por plan';


--
-- Name: COLUMN owner_financial_reports."revenueByPaymentMethod"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."revenueByPaymentMethod" IS 'Ingresos por método de pago';


--
-- Name: COLUMN owner_financial_reports."paymentsByMethod"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."paymentsByMethod" IS 'Cantidad de pagos por método';


--
-- Name: COLUMN owner_financial_reports."averageRevenuePerBusiness"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."averageRevenuePerBusiness" IS 'Ingreso promedio por negocio';


--
-- Name: COLUMN owner_financial_reports."churnRate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."churnRate" IS 'Tasa de cancelación en porcentaje';


--
-- Name: COLUMN owner_financial_reports."retentionRate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."retentionRate" IS 'Tasa de retención en porcentaje';


--
-- Name: COLUMN owner_financial_reports."previousPeriodComparison"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."previousPeriodComparison" IS 'Comparación con período anterior';


--
-- Name: COLUMN owner_financial_reports."yearOverYearGrowth"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_financial_reports."yearOverYearGrowth" IS 'Crecimiento año sobre año en porcentaje';


--
-- Name: owner_payment_configurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.owner_payment_configurations (
    id uuid NOT NULL,
    provider public.enum_owner_payment_configurations_provider NOT NULL,
    name character varying(255) NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    environment public.enum_owner_payment_configurations_environment DEFAULT 'SANDBOX'::public.enum_owner_payment_configurations_environment NOT NULL,
    configuration jsonb DEFAULT '{}'::jsonb NOT NULL,
    credentials jsonb DEFAULT '{}'::jsonb NOT NULL,
    "webhookUrl" character varying(255),
    "webhookSecret" character varying(255),
    "supportedCurrencies" character varying(255)[] DEFAULT ARRAY['COP'::character varying(255)] NOT NULL,
    "commissionRate" numeric(5,2) DEFAULT 0 NOT NULL,
    "fixedFee" numeric(10,2) DEFAULT 0 NOT NULL,
    "maxAmount" numeric(15,2),
    "minAmount" numeric(10,2),
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN owner_payment_configurations.configuration; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_payment_configurations.configuration IS 'Configuración específica del proveedor de pagos';


--
-- Name: COLUMN owner_payment_configurations.credentials; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_payment_configurations.credentials IS 'Credenciales encriptadas del proveedor';


--
-- Name: COLUMN owner_payment_configurations."commissionRate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_payment_configurations."commissionRate" IS 'Porcentaje de comisión del proveedor';


--
-- Name: COLUMN owner_payment_configurations."fixedFee"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_payment_configurations."fixedFee" IS 'Tarifa fija por transacción';


--
-- Name: COLUMN owner_payment_configurations."maxAmount"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_payment_configurations."maxAmount" IS 'Monto máximo permitido por transacción';


--
-- Name: COLUMN owner_payment_configurations."minAmount"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.owner_payment_configurations."minAmount" IS 'Monto mínimo permitido por transacción';


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    token character varying(255) NOT NULL,
    "tokenHash" character varying(255) NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "isUsed" boolean DEFAULT false NOT NULL,
    "usedAt" timestamp with time zone,
    "ipAddress" character varying(255),
    "userAgent" text,
    "requestedAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN password_reset_tokens."tokenHash"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.password_reset_tokens."tokenHash" IS 'Hash del token para seguridad adicional';


--
-- Name: payment_integrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_integrations (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    provider public.enum_payment_integrations_provider NOT NULL,
    name character varying(255) NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    environment public.enum_payment_integrations_environment DEFAULT 'SANDBOX'::public.enum_payment_integrations_environment NOT NULL,
    configuration jsonb DEFAULT '{}'::jsonb NOT NULL,
    credentials jsonb DEFAULT '{}'::jsonb NOT NULL,
    "supportedMethods" jsonb DEFAULT '["CREDIT_CARD", "DEBIT_CARD"]'::jsonb NOT NULL,
    fees jsonb DEFAULT '{"fixed": 0, "currency": "COP", "percentage": 0}'::jsonb,
    limits jsonb DEFAULT '{"maxAmount": null, "minAmount": 0, "dailyLimit": null, "monthlyLimit": null}'::jsonb,
    "webhookUrl" character varying(255),
    "webhookSecret" character varying(255),
    "lastSync" timestamp with time zone,
    status public.enum_payment_integrations_status DEFAULT 'PENDING_VERIFICATION'::public.enum_payment_integrations_status NOT NULL,
    "errorMessage" text,
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: plan_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_modules (
    id uuid NOT NULL,
    "subscriptionPlanId" uuid NOT NULL,
    "moduleId" uuid NOT NULL,
    "isIncluded" boolean DEFAULT true NOT NULL,
    "limitQuantity" integer,
    "additionalPrice" numeric(10,2) DEFAULT 0 NOT NULL,
    configuration jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    sku character varying(255),
    barcode character varying(255),
    category character varying(255),
    brand character varying(255),
    price numeric(10,2) NOT NULL,
    cost numeric(10,2) DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "trackInventory" boolean DEFAULT true NOT NULL,
    "currentStock" integer DEFAULT 0 NOT NULL,
    "minStock" integer DEFAULT 0 NOT NULL,
    "maxStock" integer,
    unit character varying(255) DEFAULT 'unit'::character varying NOT NULL,
    weight numeric(8,3),
    dimensions jsonb DEFAULT '{"unit": "cm", "width": null, "height": null, "length": null}'::jsonb,
    images jsonb DEFAULT '[]'::jsonb,
    taxable boolean DEFAULT true NOT NULL,
    "taxRate" numeric(5,2) DEFAULT 0 NOT NULL,
    supplier jsonb DEFAULT '{}'::jsonb,
    tags jsonb DEFAULT '[]'::jsonb,
    variants jsonb DEFAULT '[]'::jsonb,
    "expirationTracking" boolean DEFAULT false NOT NULL,
    "batchTracking" boolean DEFAULT false NOT NULL,
    "serialTracking" boolean DEFAULT false NOT NULL,
    product_type public.enum_products_product_type DEFAULT 'BOTH'::public.enum_products_product_type NOT NULL,
    requires_specialist_tracking boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: rule_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rule_templates (
    id uuid NOT NULL,
    key character varying(100) NOT NULL,
    type public.enum_rule_templates_type NOT NULL,
    "defaultValue" jsonb NOT NULL,
    description text,
    category public.enum_rule_templates_category DEFAULT 'GENERAL'::public.enum_rule_templates_category NOT NULL,
    "allowCustomization" boolean DEFAULT true NOT NULL,
    version character varying(20) DEFAULT '1.0.0'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "validationRules" jsonb,
    examples jsonb,
    required_module character varying(100),
    "createdBy" uuid,
    "updatedBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN rule_templates."defaultValue"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rule_templates."defaultValue" IS 'Valor por defecto de la regla';


--
-- Name: COLUMN rule_templates.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rule_templates.description IS 'Descripción detallada de qué hace esta regla';


--
-- Name: COLUMN rule_templates."allowCustomization"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rule_templates."allowCustomization" IS 'Si los negocios pueden personalizar esta regla';


--
-- Name: COLUMN rule_templates.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rule_templates.version IS 'Versión de la regla para control de cambios';


--
-- Name: COLUMN rule_templates."isActive"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rule_templates."isActive" IS 'Si la regla está disponible para uso';


--
-- Name: COLUMN rule_templates."validationRules"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rule_templates."validationRules" IS 'Reglas de validación para valores personalizados';


--
-- Name: COLUMN rule_templates.examples; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rule_templates.examples IS 'Ejemplos de uso de la regla';


--
-- Name: COLUMN rule_templates.required_module; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rule_templates.required_module IS 'Nombre del módulo requerido para usar esta regla (ej: facturacion_electronica, gestion_de_turnos)';


--
-- Name: COLUMN rule_templates."createdBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rule_templates."createdBy" IS 'Usuario que creó la regla';


--
-- Name: COLUMN rule_templates."updatedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rule_templates."updatedBy" IS 'Usuario que actualizó la regla por última vez';


--
-- Name: service_commissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_commissions (
    id uuid NOT NULL,
    "serviceId" uuid NOT NULL,
    type public.enum_service_commissions_type DEFAULT 'PERCENTAGE'::public.enum_service_commissions_type NOT NULL,
    "specialistPercentage" numeric(5,2) DEFAULT 50,
    "businessPercentage" numeric(5,2) DEFAULT 50,
    "fixedAmount" numeric(10,2) DEFAULT 0,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN service_commissions."serviceId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.service_commissions."serviceId" IS 'Servicio al que aplica esta comisión';


--
-- Name: COLUMN service_commissions."specialistPercentage"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.service_commissions."specialistPercentage" IS 'Porcentaje de comisión para el especialista';


--
-- Name: COLUMN service_commissions."businessPercentage"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.service_commissions."businessPercentage" IS 'Porcentaje para el negocio (debe sumar 100 con specialistPercentage)';


--
-- Name: COLUMN service_commissions."fixedAmount"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.service_commissions."fixedAmount" IS 'Monto fijo de comisión (usado cuando type = FIXED)';


--
-- Name: COLUMN service_commissions.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.service_commissions.notes IS 'Notas adicionales sobre esta comisión específica';


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid NOT NULL,
    "businessId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(255),
    price numeric(10,2) NOT NULL,
    duration integer NOT NULL,
    "requiresConsent" boolean DEFAULT false NOT NULL,
    "consentTemplateId" uuid,
    "isActive" boolean DEFAULT true NOT NULL,
    color character varying(255),
    "preparationTime" integer DEFAULT 0 NOT NULL,
    "cleanupTime" integer DEFAULT 0 NOT NULL,
    "maxConcurrent" integer DEFAULT 1 NOT NULL,
    "requiresEquipment" jsonb DEFAULT '[]'::jsonb,
    "skillsRequired" jsonb DEFAULT '[]'::jsonb,
    images jsonb DEFAULT '[]'::jsonb NOT NULL,
    "bookingSettings" jsonb DEFAULT '{"allowWaitlist": true, "requiresApproval": false, "advanceBookingDays": 30, "onlineBookingEnabled": true}'::jsonb,
    tags jsonb DEFAULT '[]'::jsonb,
    "isPackage" boolean DEFAULT false NOT NULL,
    "packageType" public."enum_services_packageType" DEFAULT 'SINGLE'::public."enum_services_packageType" NOT NULL,
    "packageConfig" jsonb,
    "totalPrice" numeric(10,2),
    "allowPartialPayment" boolean DEFAULT false NOT NULL,
    "pricePerSession" numeric(10,2),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN services."requiresConsent"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.services."requiresConsent" IS 'Si este servicio requiere consentimiento firmado del cliente';


--
-- Name: COLUMN services."consentTemplateId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.services."consentTemplateId" IS 'Template de consentimiento por defecto para este servicio';


--
-- Name: COLUMN services."isPackage"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.services."isPackage" IS 'Indica si este servicio es un paquete multi-sesión';


--
-- Name: COLUMN services."packageConfig"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.services."packageConfig" IS 'Configuración del paquete: { sessions: number, sessionInterval: number, maintenanceInterval: number, maintenanceSessions: number, pricing: { perSession: number, discount: number } }';


--
-- Name: COLUMN services."allowPartialPayment"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.services."allowPartialPayment" IS 'Permite pago por sesión o solo pago completo upfront';


--
-- Name: COLUMN services."pricePerSession"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.services."pricePerSession" IS 'Precio por sesión individual si se permite pago parcial';


--
-- Name: specialist_branch_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specialist_branch_schedules (
    id uuid NOT NULL,
    "specialistId" uuid NOT NULL,
    "branchId" uuid NOT NULL,
    "dayOfWeek" public."enum_specialist_branch_schedules_dayOfWeek" NOT NULL,
    "startTime" time without time zone NOT NULL,
    "endTime" time without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN specialist_branch_schedules."startTime"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_branch_schedules."startTime" IS 'Hora de inicio del turno';


--
-- Name: COLUMN specialist_branch_schedules."endTime"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_branch_schedules."endTime" IS 'Hora de fin del turno';


--
-- Name: COLUMN specialist_branch_schedules."isActive"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_branch_schedules."isActive" IS 'Indica si este horario está activo';


--
-- Name: COLUMN specialist_branch_schedules.priority; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_branch_schedules.priority IS 'Prioridad del horario (útil para conflictos, mayor número = mayor prioridad)';


--
-- Name: COLUMN specialist_branch_schedules.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_branch_schedules.notes IS 'Notas adicionales sobre este horario';


--
-- Name: specialist_commissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specialist_commissions (
    id uuid NOT NULL,
    "specialistId" uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "serviceId" uuid,
    "commissionType" public."enum_specialist_commissions_commissionType" DEFAULT 'PERCENTAGE'::public."enum_specialist_commissions_commissionType" NOT NULL,
    "commissionValue" numeric(5,2) NOT NULL,
    currency character varying(255) DEFAULT 'COP'::character varying NOT NULL,
    "paymentFrequency" public."enum_specialist_commissions_paymentFrequency" DEFAULT 'BIWEEKLY'::public."enum_specialist_commissions_paymentFrequency" NOT NULL,
    "paymentDay" integer,
    "minimumAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "effectiveFrom" timestamp with time zone NOT NULL,
    "effectiveTo" timestamp with time zone,
    notes text,
    "createdBy" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: specialist_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specialist_documents (
    id uuid NOT NULL,
    "specialistId" uuid NOT NULL,
    "businessId" uuid NOT NULL,
    "documentType" public."enum_specialist_documents_documentType" NOT NULL,
    "fileName" character varying(255) NOT NULL,
    "originalName" character varying(255) NOT NULL,
    "fileUrl" character varying(255) NOT NULL,
    "mimeType" character varying(255) NOT NULL,
    "fileSize" integer NOT NULL,
    "uploadedBy" uuid NOT NULL,
    status public.enum_specialist_documents_status DEFAULT 'PENDING'::public.enum_specialist_documents_status NOT NULL,
    notes text,
    "approvedBy" uuid,
    "approvedAt" timestamp with time zone,
    "rejectionReason" text,
    "expirationDate" timestamp with time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: specialist_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specialist_profiles (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "businessId" uuid NOT NULL,
    specialization character varying(255),
    biography text,
    experience integer,
    certifications jsonb DEFAULT '[]'::jsonb,
    "profileImage" character varying(255),
    "isActive" boolean DEFAULT true NOT NULL,
    "commissionRate" numeric(5,2) DEFAULT 50,
    "commissionType" public."enum_specialist_profiles_commissionType" DEFAULT 'PERCENTAGE'::public."enum_specialist_profiles_commissionType" NOT NULL,
    "fixedCommissionAmount" numeric(10,2),
    "workingDays" jsonb DEFAULT '{"friday": true, "monday": true, "sunday": false, "tuesday": true, "saturday": true, "thursday": true, "wednesday": true}'::jsonb,
    "workingHours" jsonb DEFAULT '{"end": "18:00", "start": "09:00"}'::jsonb,
    "customSchedule" jsonb,
    "breakTime" jsonb DEFAULT '{"end": "13:00", "start": "12:00", "enabled": true}'::jsonb,
    skills jsonb DEFAULT '[]'::jsonb,
    languages jsonb DEFAULT '["es"]'::jsonb,
    rating numeric(3,2),
    "totalReviews" integer DEFAULT 0 NOT NULL,
    "phoneExtension" character varying(255),
    "emergencyContact" jsonb,
    "socialMedia" jsonb,
    preferences jsonb DEFAULT '{"allowBookingNotifications": true, "allowReminderNotifications": true, "allowPromotionNotifications": false, "preferredNotificationMethod": "email"}'::jsonb,
    status public.enum_specialist_profiles_status DEFAULT 'ACTIVE'::public.enum_specialist_profiles_status NOT NULL,
    "hireDate" timestamp with time zone,
    "contractType" public."enum_specialist_profiles_contractType" DEFAULT 'EMPLOYEE'::public."enum_specialist_profiles_contractType" NOT NULL,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN specialist_profiles.specialization; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles.specialization IS 'Especialización profesional (ej: Colorista, Barbero, Estilista)';


--
-- Name: COLUMN specialist_profiles.biography; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles.biography IS 'Biografía profesional del especialista';


--
-- Name: COLUMN specialist_profiles.experience; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles.experience IS 'Años de experiencia';


--
-- Name: COLUMN specialist_profiles.certifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles.certifications IS 'Lista de certificaciones y títulos';


--
-- Name: COLUMN specialist_profiles."profileImage"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."profileImage" IS 'URL de la imagen de perfil profesional';


--
-- Name: COLUMN specialist_profiles."isActive"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."isActive" IS 'Si el especialista está activo para recibir citas';


--
-- Name: COLUMN specialist_profiles."commissionRate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."commissionRate" IS 'Porcentaje de comisión por servicio (0-100%)';


--
-- Name: COLUMN specialist_profiles."fixedCommissionAmount"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."fixedCommissionAmount" IS 'Monto fijo de comisión cuando commissionType es FIXED_AMOUNT';


--
-- Name: COLUMN specialist_profiles."workingDays"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."workingDays" IS 'Días de trabajo del especialista';


--
-- Name: COLUMN specialist_profiles."workingHours"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."workingHours" IS 'Horario de trabajo general del especialista';


--
-- Name: COLUMN specialist_profiles."customSchedule"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."customSchedule" IS 'Horarios personalizados por día de la semana';


--
-- Name: COLUMN specialist_profiles."breakTime"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."breakTime" IS 'Horario de descanso/almuerzo';


--
-- Name: COLUMN specialist_profiles.skills; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles.skills IS 'Lista de habilidades y especialidades específicas';


--
-- Name: COLUMN specialist_profiles.languages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles.languages IS 'Idiomas que habla el especialista';


--
-- Name: COLUMN specialist_profiles.rating; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles.rating IS 'Calificación promedio del especialista (0-5)';


--
-- Name: COLUMN specialist_profiles."totalReviews"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."totalReviews" IS 'Número total de reseñas recibidas';


--
-- Name: COLUMN specialist_profiles."phoneExtension"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."phoneExtension" IS 'Extensión telefónica interna';


--
-- Name: COLUMN specialist_profiles."emergencyContact"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."emergencyContact" IS 'Información de contacto de emergencia';


--
-- Name: COLUMN specialist_profiles."socialMedia"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."socialMedia" IS 'Enlaces a redes sociales profesionales';


--
-- Name: COLUMN specialist_profiles.preferences; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles.preferences IS 'Preferencias de notificaciones y configuración';


--
-- Name: COLUMN specialist_profiles."hireDate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles."hireDate" IS 'Fecha de contratación';


--
-- Name: COLUMN specialist_profiles.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_profiles.notes IS 'Notas administrativas internas';


--
-- Name: specialist_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specialist_services (
    id uuid NOT NULL,
    "specialistId" uuid NOT NULL,
    "serviceId" uuid NOT NULL,
    "customPrice" numeric(10,2) DEFAULT NULL::numeric,
    "isActive" boolean DEFAULT true,
    "skillLevel" public."enum_specialist_services_skillLevel" DEFAULT 'INTERMEDIATE'::public."enum_specialist_services_skillLevel",
    "averageDuration" integer,
    "commissionPercentage" numeric(5,2),
    "canBeBooked" boolean DEFAULT true,
    "requiresApproval" boolean DEFAULT false,
    "maxBookingsPerDay" integer,
    "assignedAt" timestamp with time zone,
    "assignedBy" uuid,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN specialist_services."specialistId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services."specialistId" IS 'Usuario especialista que ofrece el servicio';


--
-- Name: COLUMN specialist_services."serviceId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services."serviceId" IS 'Servicio ofrecido por el especialista';


--
-- Name: COLUMN specialist_services."customPrice"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services."customPrice" IS 'Precio personalizado del especialista. Si es NULL, usa el precio base del servicio';


--
-- Name: COLUMN specialist_services."isActive"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services."isActive" IS 'Indica si el especialista actualmente ofrece este servicio';


--
-- Name: COLUMN specialist_services."averageDuration"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services."averageDuration" IS 'Duración promedio en minutos que toma al especialista completar este servicio';


--
-- Name: COLUMN specialist_services."commissionPercentage"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services."commissionPercentage" IS 'Porcentaje de comisión personalizado para este especialista en este servicio';


--
-- Name: COLUMN specialist_services."canBeBooked"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services."canBeBooked" IS 'Si este servicio puede ser reservado online para este especialista';


--
-- Name: COLUMN specialist_services."requiresApproval"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services."requiresApproval" IS 'Si las citas para este servicio requieren aprobación del especialista';


--
-- Name: COLUMN specialist_services."maxBookingsPerDay"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services."maxBookingsPerDay" IS 'Máximo de reservas por día para este servicio específico';


--
-- Name: COLUMN specialist_services."assignedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services."assignedAt" IS 'Fecha de asignación del servicio al especialista';


--
-- Name: COLUMN specialist_services."assignedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services."assignedBy" IS 'Usuario que realizó la asignación';


--
-- Name: COLUMN specialist_services.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.specialist_services.notes IS 'Notas sobre el servicio ofrecido por este especialista';


--
-- Name: subscription_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_payments (
    id uuid NOT NULL,
    "businessSubscriptionId" uuid,
    "paymentConfigurationId" uuid,
    amount numeric(10,2) NOT NULL,
    currency character varying(255) DEFAULT 'COP'::character varying NOT NULL,
    status public.enum_subscription_payments_status DEFAULT 'PENDING'::public.enum_subscription_payments_status NOT NULL,
    "paymentMethod" public."enum_subscription_payments_paymentMethod" NOT NULL,
    "transactionId" character varying(255),
    "externalReference" character varying(255),
    "paidAt" timestamp with time zone,
    "dueDate" timestamp with time zone NOT NULL,
    "receiptUrl" character varying(255),
    "receiptPublicId" character varying(255),
    "receiptMetadata" jsonb DEFAULT '{}'::jsonb,
    "receiptUploadedBy" uuid,
    "receiptUploadedAt" timestamp with time zone,
    "commissionFee" numeric(10,2) DEFAULT 0 NOT NULL,
    "netAmount" numeric(10,2) NOT NULL,
    description text,
    notes text,
    "failureReason" text,
    "refundReason" text,
    "refundedAmount" numeric(10,2) DEFAULT 0,
    "refundedAt" timestamp with time zone,
    "providerResponse" jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    "paymentSourceToken" character varying(255),
    "isThreeDsEnabled" boolean DEFAULT false NOT NULL,
    "threeDsAuthData" jsonb DEFAULT '{}'::jsonb,
    "browserInfo" jsonb DEFAULT '{}'::jsonb,
    "threeDsAuthType" public."enum_subscription_payments_threeDsAuthType",
    "threeDsMethodData" text,
    "currentStep" public."enum_subscription_payments_currentStep",
    "currentStepStatus" public."enum_subscription_payments_currentStepStatus",
    "isRecurringPayment" boolean DEFAULT false NOT NULL,
    "originalPaymentId" uuid,
    "recurringType" public."enum_subscription_payments_recurringType" DEFAULT 'MANUAL'::public."enum_subscription_payments_recurringType" NOT NULL,
    "autoRenewalEnabled" boolean DEFAULT false NOT NULL,
    "paymentAttempts" integer DEFAULT 1 NOT NULL,
    "lastAttemptAt" timestamp with time zone,
    "maxAttempts" integer DEFAULT 3 NOT NULL,
    "attemptHistory" jsonb DEFAULT '[]'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN subscription_payments."transactionId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."transactionId" IS 'ID de transaccion del proveedor de pagos';


--
-- Name: COLUMN subscription_payments."externalReference"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."externalReference" IS 'Referencia externa del pago';


--
-- Name: COLUMN subscription_payments."receiptUrl"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."receiptUrl" IS 'URL del comprobante de pago en Cloudinary';


--
-- Name: COLUMN subscription_payments."receiptPublicId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."receiptPublicId" IS 'Public ID del comprobante en Cloudinary para gestion';


--
-- Name: COLUMN subscription_payments."receiptMetadata"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."receiptMetadata" IS 'Metadatos del archivo';


--
-- Name: COLUMN subscription_payments."receiptUploadedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."receiptUploadedBy" IS 'Usuario que subio el comprobante';


--
-- Name: COLUMN subscription_payments."commissionFee"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."commissionFee" IS 'Comision cobrada por el proveedor de pagos';


--
-- Name: COLUMN subscription_payments."netAmount"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."netAmount" IS 'Monto neto recibido despues de comisiones';


--
-- Name: COLUMN subscription_payments.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments.notes IS 'Notas internas sobre el pago';


--
-- Name: COLUMN subscription_payments."failureReason"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."failureReason" IS 'Razon del fallo si status es FAILED';


--
-- Name: COLUMN subscription_payments."refundReason"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."refundReason" IS 'Razon del reembolso si aplica';


--
-- Name: COLUMN subscription_payments."providerResponse"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."providerResponse" IS 'Respuesta completa del proveedor de pagos';


--
-- Name: COLUMN subscription_payments."paymentSourceToken"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."paymentSourceToken" IS 'Token de la fuente de pago para cobros recurrentes (3RI)';


--
-- Name: COLUMN subscription_payments."isThreeDsEnabled"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."isThreeDsEnabled" IS 'Si la fuente de pago fue creada con 3D Secure';


--
-- Name: COLUMN subscription_payments."threeDsAuthData"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."threeDsAuthData" IS 'Datos de autenticacion 3DS completos';


--
-- Name: COLUMN subscription_payments."browserInfo"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."browserInfo" IS 'Informacion del navegador requerida para 3DS v2';


--
-- Name: COLUMN subscription_payments."threeDsMethodData"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."threeDsMethodData" IS 'HTML iframe codificado para challenge 3DS';


--
-- Name: COLUMN subscription_payments."isRecurringPayment"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."isRecurringPayment" IS 'Si es un pago recurrente automático';


--
-- Name: COLUMN subscription_payments."originalPaymentId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."originalPaymentId" IS 'Referencia al pago original que estableció el token 3DS';


--
-- Name: COLUMN subscription_payments."autoRenewalEnabled"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."autoRenewalEnabled" IS 'Si está habilitada la renovación automática';


--
-- Name: COLUMN subscription_payments."paymentAttempts"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."paymentAttempts" IS 'Número de intentos de pago realizados';


--
-- Name: COLUMN subscription_payments."lastAttemptAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."lastAttemptAt" IS 'Fecha del último intento de pago';


--
-- Name: COLUMN subscription_payments."maxAttempts"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."maxAttempts" IS 'Máximo número de intentos permitidos';


--
-- Name: COLUMN subscription_payments."attemptHistory"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_payments."attemptHistory" IS 'Historial de intentos con detalles de errores';


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    "monthlyPrice" numeric(10,2),
    "annualPrice" numeric(10,2),
    "billingCycle" public."enum_subscription_plans_billingCycle" DEFAULT 'MONTHLY'::public."enum_subscription_plans_billingCycle" NOT NULL,
    "annualDiscountPercent" integer DEFAULT 0 NOT NULL,
    currency character varying(255) DEFAULT 'COP'::character varying NOT NULL,
    duration integer NOT NULL,
    "durationType" public."enum_subscription_plans_durationType" DEFAULT 'MONTHS'::public."enum_subscription_plans_durationType" NOT NULL,
    "maxUsers" integer,
    "maxClients" integer,
    "maxAppointments" integer,
    "storageLimit" bigint,
    status public.enum_subscription_plans_status DEFAULT 'ACTIVE'::public.enum_subscription_plans_status NOT NULL,
    "isPopular" boolean DEFAULT false NOT NULL,
    "trialDays" integer DEFAULT 0 NOT NULL,
    features jsonb DEFAULT '{}'::jsonb,
    limitations jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "maxServices" integer
);


--
-- Name: COLUMN subscription_plans.price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_plans.price IS 'Precio base/mensual del plan';


--
-- Name: COLUMN subscription_plans."monthlyPrice"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_plans."monthlyPrice" IS 'Precio mensual (si se paga mes a mes)';


--
-- Name: COLUMN subscription_plans."annualPrice"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_plans."annualPrice" IS 'Precio anual (si se paga el año completo - con descuento)';


--
-- Name: COLUMN subscription_plans."annualDiscountPercent"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_plans."annualDiscountPercent" IS 'Porcentaje de descuento al pagar anual (ej: 20 = 20% off)';


--
-- Name: COLUMN subscription_plans."maxServices"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_plans."maxServices" IS 'Máximo número de servicios/procedimientos permitidos';


--
-- Name: user_branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_branches (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "branchId" uuid NOT NULL,
    "isDefault" boolean DEFAULT false,
    "canManageSchedule" boolean DEFAULT true,
    "canCreateAppointments" boolean DEFAULT true,
    "assignedAt" timestamp with time zone,
    "assignedBy" uuid,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN user_branches."isDefault"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_branches."isDefault" IS 'Indica si esta es la sucursal principal del usuario';


--
-- Name: COLUMN user_branches."canManageSchedule"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_branches."canManageSchedule" IS 'Si el usuario puede gestionar su horario en esta sucursal';


--
-- Name: COLUMN user_branches."canCreateAppointments"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_branches."canCreateAppointments" IS 'Si el usuario puede crear citas en esta sucursal';


--
-- Name: COLUMN user_branches."assignedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_branches."assignedAt" IS 'Fecha de asignación a la sucursal';


--
-- Name: COLUMN user_branches."assignedBy"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_branches."assignedBy" IS 'Usuario que realizó la asignación';


--
-- Name: COLUMN user_branches.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_branches.notes IS 'Notas sobre la asignación del usuario a esta sucursal';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    phone character varying(255),
    role public.enum_users_role DEFAULT 'CLIENT'::public.enum_users_role NOT NULL,
    status public.enum_users_status DEFAULT 'ACTIVE'::public.enum_users_status NOT NULL,
    avatar character varying(255),
    "businessId" uuid,
    "lastLogin" timestamp with time zone,
    "emailVerified" boolean DEFAULT false,
    "emailVerificationToken" character varying(255),
    "passwordResetToken" character varying(255),
    "passwordResetExpires" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: whatsapp_message_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_message_templates (
    id uuid NOT NULL,
    business_id uuid NOT NULL,
    template_name character varying(100) NOT NULL,
    language character varying(10) DEFAULT 'es'::character varying NOT NULL,
    category character varying(50) DEFAULT 'TRANSACTIONAL'::character varying NOT NULL,
    body text NOT NULL,
    header character varying(500),
    footer character varying(500),
    buttons jsonb,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    meta_template_id character varying(100),
    rejection_reason text,
    approved_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN whatsapp_message_templates.template_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_message_templates.template_name IS 'Template name (lowercase, underscores only)';


--
-- Name: COLUMN whatsapp_message_templates.language; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_message_templates.language IS 'Language code (es, en, pt_BR, etc.)';


--
-- Name: COLUMN whatsapp_message_templates.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_message_templates.category IS 'Template category';


--
-- Name: COLUMN whatsapp_message_templates.body; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_message_templates.body IS 'Template body text';


--
-- Name: COLUMN whatsapp_message_templates.header; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_message_templates.header IS 'Optional header text';


--
-- Name: COLUMN whatsapp_message_templates.footer; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_message_templates.footer IS 'Optional footer text';


--
-- Name: COLUMN whatsapp_message_templates.buttons; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_message_templates.buttons IS 'Optional buttons configuration';


--
-- Name: COLUMN whatsapp_message_templates.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_message_templates.status IS 'Template approval status';


--
-- Name: COLUMN whatsapp_message_templates.meta_template_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_message_templates.meta_template_id IS 'Template ID assigned by Meta after submission';


--
-- Name: COLUMN whatsapp_message_templates.rejection_reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_message_templates.rejection_reason IS 'Reason for rejection if status is REJECTED';


--
-- Name: COLUMN whatsapp_message_templates.approved_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_message_templates.approved_at IS 'When template was approved by Meta';


--
-- Name: whatsapp_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_messages (
    id uuid NOT NULL,
    business_id uuid NOT NULL,
    client_id uuid,
    appointment_id uuid,
    "to" character varying(20) NOT NULL,
    phone_number_id character varying(100) NOT NULL,
    message_type character varying(50) NOT NULL,
    payload jsonb NOT NULL,
    provider_message_id character varying(100),
    status character varying(20) DEFAULT 'QUEUED'::character varying NOT NULL,
    error_code character varying(50),
    error_message text,
    sent_at timestamp with time zone,
    delivered_at timestamp with time zone,
    read_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: whatsapp_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_tokens (
    id uuid NOT NULL,
    business_id uuid NOT NULL,
    encrypted_token text NOT NULL,
    token_type character varying(50) DEFAULT 'USER_ACCESS_TOKEN'::character varying NOT NULL,
    expires_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    last_rotated_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: whatsapp_webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_webhook_events (
    id uuid NOT NULL,
    business_id uuid NOT NULL,
    event_type character varying(50) NOT NULL,
    phone_number_id character varying(100),
    message_id character varying(100),
    payload jsonb NOT NULL,
    processed boolean DEFAULT false NOT NULL,
    processed_at timestamp with time zone,
    processing_error text,
    received_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN whatsapp_webhook_events.event_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_webhook_events.event_type IS 'Type of webhook event';


--
-- Name: COLUMN whatsapp_webhook_events.phone_number_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_webhook_events.phone_number_id IS 'Phone number ID from webhook';


--
-- Name: COLUMN whatsapp_webhook_events.message_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_webhook_events.message_id IS 'Message ID if event is message-related';


--
-- Name: COLUMN whatsapp_webhook_events.payload; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_webhook_events.payload IS 'Full webhook payload from Meta';


--
-- Name: COLUMN whatsapp_webhook_events.processed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_webhook_events.processed IS 'Whether event has been processed successfully';


--
-- Name: COLUMN whatsapp_webhook_events.processed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_webhook_events.processed_at IS 'When event was processed';


--
-- Name: COLUMN whatsapp_webhook_events.processing_error; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_webhook_events.processing_error IS 'Error message if processing failed';


--
-- Name: COLUMN whatsapp_webhook_events.received_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.whatsapp_webhook_events.received_at IS 'When webhook was received';


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, "businessId", "branchId", "clientId", "specialistId", "serviceId", "appointmentNumber", "startTime", "endTime", status, "paymentStatus", "totalAmount", "paidAmount", "discountAmount", notes, "clientNotes", "specialistNotes", "cancelReason", "canceledAt", "canceledBy", "confirmedAt", "startedAt", "completedAt", "hasConsent", "consentSignedAt", "consentDocument", evidence, rating, feedback, "remindersSent", "isOnline", "meetingLink", "rescheduleHistory", "additionalServices", "advancePayment", "wompiPaymentReference", "depositStatus", metadata, "createdAt", "updatedAt") FROM stdin;
21ec49a9-69da-4779-aac9-cf7b741f4358	cd19320e-8f65-4e05-ab2c-aac7024bf8c3	185c68aa-37f6-47f1-b02f-2a0f41905df3	5ccd7fbb-90fc-45e9-ad47-0cd7adf4d59c	2c0a99de-8d84-448b-a17f-a38d5edb54e8	2636bfa5-e118-4dd5-b258-025272b87001	CITA-1765416007563	2025-12-11 16:00:00+00	2025-12-11 16:45:00+00	PENDING	PENDING	250000.00	0.00	0.00	Promocion Faciales	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	{"after": [], "before": [], "documents": []}	\N	\N	[]	f	\N	[]	[]	\N	\N	NOT_REQUIRED	{}	2025-12-11 01:20:07.564+00	2025-12-11 01:20:07.564+00
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, "businessId", name, code, description, address, city, state, country, "zipCode", phone, email, latitude, longitude, timezone, "isMain", status, "businessHours", settings, "createdAt", "updatedAt") FROM stdin;
185c68aa-37f6-47f1-b02f-2a0f41905df3	cd19320e-8f65-4e05-ab2c-aac7024bf8c3	luzdepiel2	LUZ-087	\N	Calle 6 sur # 1c 55 Balcones del sol 2 T3 Apto 503	Restrepo	Meta	Colombia	\N	+573502142082	dagtiso@gmail.com	\N	\N	America/Bogota	f	ACTIVE	{"friday": {"open": "09:00", "close": "18:00", "closed": false}, "monday": {"open": "09:00", "close": "18:00", "closed": false}, "sunday": {"open": null, "close": null, "closed": true}, "tuesday": {"open": "09:00", "close": "18:00", "closed": false}, "saturday": {"open": "09:00", "close": "14:00", "closed": false}, "thursday": {"open": "09:00", "close": "18:00", "closed": false}, "wednesday": {"open": "09:00", "close": "18:00", "closed": false}}	{}	2025-11-25 13:42:50.325+00	2025-11-25 13:42:50.325+00
d8f284fe-d22d-4337-a3b8-7a4413596906	b1effc61-cd62-45fc-a942-8eb8c144a721	mas3d - Principal	MAS3D-MAIN	\N	Cra 43a # 26c -44 El buque Villavicencio, Colombia Fucsia insumos	Restrepo	\N	Argentina	\N	+573013013011	mercedeslobeto@gmail.com	\N	\N	America/Bogota	t	ACTIVE	{"friday": {"open": "09:00", "close": "18:00", "closed": false}, "monday": {"open": "09:00", "close": "18:00", "closed": false}, "sunday": {"open": null, "close": null, "closed": true}, "tuesday": {"open": "09:00", "close": "18:00", "closed": false}, "saturday": {"open": "09:00", "close": "14:00", "closed": false}, "thursday": {"open": "09:00", "close": "18:00", "closed": false}, "wednesday": {"open": "09:00", "close": "18:00", "closed": false}}	{}	2025-11-25 23:50:36.487+00	2025-11-25 23:50:36.487+00
\.


--
-- Data for Name: business_clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_clients (id, "businessId", "clientId", "clientNumber", status, "firstVisit", "lastVisit", "totalVisits", "totalSpent", "averageRating", "preferredSpecialistId", "businessNotes", "businessTags", "loyaltyPoints", "discountEligible", "hasOutstandingBalance", "outstandingAmount", "hasPendingCancellation", "customFields", "createdAt", "updatedAt") FROM stdin;
862d056a-fcf7-4d57-9908-6ff2d5fc0058	cd19320e-8f65-4e05-ab2c-aac7024bf8c3	5ccd7fbb-90fc-45e9-ad47-0cd7adf4d59c	\N	ACTIVE	2025-12-11 01:20:06.832+00	\N	0	0.00	\N	\N	\N	[]	0	f	f	0.00	f	{}	2025-12-11 01:20:06.833+00	2025-12-11 01:20:06.833+00
\.


--
-- Data for Name: business_commission_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_commission_configs (id, "businessId", "commissionsEnabled", "calculationType", "generalPercentage", notes, "createdAt", "updatedAt") FROM stdin;
2ae72b9d-7531-40ac-9b82-896e02dc0566	cd19320e-8f65-4e05-ab2c-aac7024bf8c3	t	GENERAL	50.00	\N	2025-11-25 13:47:59.959+00	2025-11-25 13:47:59.959+00
691be545-58b8-40cb-8a06-19345388819b	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	t	GENERAL	50.00	\N	2025-11-29 15:17:16.506+00	2025-11-29 15:17:16.506+00
1ef3d765-e438-4dbf-86ea-72d1268c8b45	b1effc61-cd62-45fc-a942-8eb8c144a721	t	GENERAL	50.00	\N	2025-12-11 00:30:50.745+00	2025-12-11 00:30:50.745+00
\.


--
-- Data for Name: business_expense_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_expense_categories (id, "businessId", name, description, color, icon, "requiresReceipt", "isRecurring", "defaultAmount", "isActive", "sortOrder", "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
3be0c590-e92d-4d19-a0ab-0c4ae49ad02a	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	Arriendo	Pago de arriendo del local	#EF4444	home	t	t	\N	t	0	11d4c161-53da-4c7b-b5d3-5a1531e8d082	\N	2025-11-29 15:52:27.926+00	2025-11-29 15:52:27.926+00
2e5f2c9b-1e09-47aa-a538-112b6dcb1b04	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	Servicios públicos	Agua, luz, gas, internet	#F59E0B	bolt	t	t	\N	t	1	11d4c161-53da-4c7b-b5d3-5a1531e8d082	\N	2025-11-29 15:52:28.012+00	2025-11-29 15:52:28.012+00
a4956829-955a-4434-9218-72b39a3e2618	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	Nómina	Pago de salarios	#10B981	users	f	t	\N	t	2	11d4c161-53da-4c7b-b5d3-5a1531e8d082	\N	2025-11-29 15:52:28.077+00	2025-11-29 15:52:28.077+00
3add9356-bcc0-4172-aa3a-c791050d3b16	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	Comisiones a Especialistas	Pago de comisiones a especialistas por servicios realizados	#8B5CF6	currency-dollar	f	t	\N	t	3	11d4c161-53da-4c7b-b5d3-5a1531e8d082	\N	2025-11-29 15:52:28.143+00	2025-11-29 15:52:28.143+00
55b9802b-2ab5-41d8-bcba-505be18faf05	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	Insumos y productos	Compra de productos y materiales	#A855F7	shopping-cart	t	f	\N	t	4	11d4c161-53da-4c7b-b5d3-5a1531e8d082	\N	2025-11-29 15:52:28.208+00	2025-11-29 15:52:28.208+00
4e070c80-e245-400d-9bfd-7ed34b3ceaa1	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	Marketing	Publicidad y promoción	#EC4899	megaphone	f	f	\N	t	5	11d4c161-53da-4c7b-b5d3-5a1531e8d082	\N	2025-11-29 15:52:28.273+00	2025-11-29 15:52:28.273+00
c8f68b53-ae94-443f-8fb8-49bcaba0aba9	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	Mantenimiento	Reparaciones y mantenimiento	#6366F1	wrench	t	f	\N	t	6	11d4c161-53da-4c7b-b5d3-5a1531e8d082	\N	2025-11-29 15:52:28.338+00	2025-11-29 15:52:28.338+00
9954dbc7-228e-4d3d-97ea-3621ae504c0f	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	Impuestos	Impuestos y contribuciones	#DC2626	document-text	t	f	\N	t	7	11d4c161-53da-4c7b-b5d3-5a1531e8d082	\N	2025-11-29 15:52:28.403+00	2025-11-29 15:52:28.403+00
16ab2388-3eec-458f-9aa4-6014cf43a8b9	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	Otros gastos	Gastos varios	#6B7280	dots-horizontal	f	f	\N	t	8	11d4c161-53da-4c7b-b5d3-5a1531e8d082	\N	2025-11-29 15:52:28.468+00	2025-11-29 15:52:28.468+00
\.


--
-- Data for Name: business_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_expenses (id, "businessId", "categoryId", description, amount, currency, "expenseDate", "dueDate", "paidDate", vendor, "vendorTaxId", "vendorPhone", "vendorEmail", "receiptUrl", "receiptPublicId", "receiptType", "receiptOriginalName", "taxAmount", "taxRate", "paymentMethod", "transactionReference", status, "isRecurring", "recurringFrequency", "nextRecurrenceDate", notes, "internalReference", "approvedBy", "approvedAt", "rejectionReason", "isActive", "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: business_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_rules (id, "businessId", "ruleTemplateId", "customValue", "isActive", "updatedBy", notes, "appliedAt", "createdAt", "updatedAt") FROM stdin;
6c3e51f5-a2cc-43e7-afa4-6db37376e3d4	b1effc61-cd62-45fc-a942-8eb8c144a721	c4c91421-f333-41f0-acf5-4ce7f1f9f321	\N	t	cd6660d5-8cf1-409f-acea-d54f5f07375e	\N	2025-11-27 22:39:46.613+00	2025-11-27 22:39:46.613+00	2025-11-27 22:39:46.613+00
\.


--
-- Data for Name: business_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_subscriptions (id, "businessId", "subscriptionPlanId", status, "startDate", "endDate", "trialEndDate", "autoRenew", "paymentMethod", "paymentStatus", "lastPaymentDate", "nextPaymentDate", amount, currency, "billingCycle", "discountApplied", notes, "canceledAt", "cancelReason", metadata, "createdAt", "updatedAt") FROM stdin;
d04bc2eb-1a1f-4cd1-9b03-251c3fa076c6	cd19320e-8f65-4e05-ab2c-aac7024bf8c3	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	TRIAL	2025-11-25 13:28:14.996+00	2025-12-25 13:28:14.996+00	2025-12-25 13:28:14.996+00	t	\N	PENDING	\N	\N	249900.00	COP	MONTHLY	0.00	\N	\N	\N	{}	2025-11-25 13:28:14.996+00	2025-11-25 13:28:14.996+00
b4cc99f8-eb8a-4156-9041-8c4e5ec05e22	9a5a8595-767b-4723-8351-7dbdb698551e	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	TRIAL	2025-11-25 20:29:33.635+00	2025-12-25 20:29:33.635+00	2025-12-25 20:29:33.635+00	t	CASH	PENDING	\N	\N	249900.00	COP	MONTHLY	0.00	\N	\N	\N	{}	2025-11-25 20:29:33.636+00	2025-11-25 20:29:33.636+00
b4b7d550-d4bc-4837-b204-3e5995698473	27731894-c142-4fb0-b59f-be208d0035f1	e3209392-2b42-4621-b197-f0e44c439067	TRIAL	2025-11-29 15:10:26.399+00	2025-12-29 15:10:26.399+00	\N	t	\N	PENDING	\N	\N	0.00	COP	MONTHLY	0.00	\N	\N	\N	{}	2025-11-29 15:10:26.399+00	2025-11-29 15:10:26.4+00
960cb7bf-6fae-49ee-aade-041bb9482237	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	PENDING	2025-11-29 15:14:55.893+00	2025-12-29 15:14:55.893+00	\N	t	\N	PENDING	\N	\N	0.00	COP	MONTHLY	0.00	\N	\N	\N	{}	2025-11-29 15:14:55.893+00	2025-11-29 15:55:35.338+00
a9339984-308e-4130-a5df-0f16385b4c75	b1effc61-cd62-45fc-a942-8eb8c144a721	7d215269-e865-4786-b780-e198c12e8546	ACTIVE	2025-11-25 23:47:32.337+00	2025-12-25 23:47:32.337+00	2025-12-25 23:47:32.337+00	t	\N	PENDING	\N	\N	249900.00	COP	MONTHLY	0.00	\N	\N	\N	{}	2025-11-25 23:47:32.337+00	2025-12-11 12:10:16.334+00
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.businesses (id, name, description, logo, email, phone, address, city, state, country, "zipCode", "taxId", website, subdomain, status, timezone, currency, language, "subscriptionStartDate", "subscriptionEndDate", "trialEndDate", "dataRetentionUntil", "currentPlanId", settings, "createdAt", "updatedAt") FROM stdin;
ec592575-6c48-49ce-ae7d-bfdd93c7e0c3	Business A	\N	\N	businessA@test.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	America/Bogota	COP	es	\N	\N	\N	\N	\N	{}	2025-11-24 22:28:20.595+00	2025-11-24 22:28:20.595+00
676e10b7-7e0f-4146-b1c6-280dd2d6e910	Business B	\N	\N	businessB@test.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	America/Bogota	COP	es	\N	\N	\N	\N	\N	{}	2025-11-24 22:28:29.937+00	2025-11-24 22:28:29.937+00
363c2ab1-dd95-4cc5-a881-6df3e5ed3cba	Business A	\N	\N	businessA@test.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	America/Bogota	COP	es	\N	\N	\N	\N	\N	{}	2025-11-24 22:28:59.119+00	2025-11-24 22:28:59.119+00
da8f9a72-f04c-4056-a0cc-ac045906e542	Business B	\N	\N	businessB@test.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	America/Bogota	COP	es	\N	\N	\N	\N	\N	{}	2025-11-24 22:29:02.539+00	2025-11-24 22:29:02.539+00
27731894-c142-4fb0-b59f-be208d0035f1	Kau	\N	\N	kau@gmail.com	+573204030369	Villavicencio 	Villavo 	\N	Colombia	\N	\N	\N	kau	TRIAL	America/Bogota	COP	es	\N	\N	2025-12-29 15:10:26.257+00	\N	e3209392-2b42-4621-b197-f0e44c439067	{}	2025-11-29 15:10:26.257+00	2025-11-29 15:10:26.258+00
cd19320e-8f65-4e05-ab2c-aac7024bf8c3	luzdepiel	tratamientos faciales	https://res.cloudinary.com/dxfgdwmwd/image/upload/v1764077689/beauty-control/businesses/cd19320e-8f65-4e05-ab2c-aac7024bf8c3/logos/main/sogtrmbwbwklnmqmagyu.jpg	gardel1129@hotmail.com	+573247624019	Cra 43a # 26c -44 El buque Villavicencio, Colombia Fucsia insumos	Meta	\N	Colombia	\N	\N	\N	luzdepiel	TRIAL	America/Bogota	COP	es	\N	\N	2025-12-25 13:28:14.848+00	\N	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	{"branding": {"logo": "https://res.cloudinary.com/dxfgdwmwd/image/upload/v1764077689/beauty-control/businesses/cd19320e-8f65-4e05-ab2c-aac7024bf8c3/logos/main/sogtrmbwbwklnmqmagyu.jpg", "fontFamily": "Poppins", "accentColor": "#FFE66D", "primaryColor": "#eab3c6", "logoThumbnail": "https://res.cloudinary.com/dxfgdwmwd/image/upload/v1764077691/beauty-control/businesses/cd19320e-8f65-4e05-ab2c-aac7024bf8c3/logos/thumbs/vokmkdfbawhqp2dh3zra.png", "secondaryColor": "#ac86a9"}}	2025-11-25 13:28:14.848+00	2025-11-25 17:43:59.073+00
9a5a8595-767b-4723-8351-7dbdb698551e	Felix E. Duran 	\N	\N	felixe.duran@gmail.com	3108707349			\N	Colombia	\N	\N	\N	eduardobarberia	ACTIVE	America/Bogota	COP	es	\N	\N	\N	\N	\N	{}	2025-11-25 20:29:33.497+00	2025-11-25 20:29:33.497+00
b67bc737-cc58-4cf5-bc9b-03a52868cb8d	Kauu		\N	guillonix@gmail.com	+573204030369	Villavo	Villavicencio 	\N	Colombia	\N	\N	\N	kauu	TRIAL	America/Bogota	COP	es	\N	\N	2025-12-29 15:14:55.757+00	\N	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	{}	2025-11-29 15:14:55.757+00	2025-11-29 15:55:35.412+00
b1effc61-cd62-45fc-a942-8eb8c144a721	mas3d	\N	https://res.cloudinary.com/dxfgdwmwd/image/upload/v1764114545/beauty-control/businesses/b1effc61-cd62-45fc-a942-8eb8c144a721/logos/main/cdinm1adt6rgepzlupey.png	mercedeslobeto@gmail.com	+573013013011	Cra 43a # 26c -44 El buque Villavicencio, Colombia Fucsia insumos	Restrepo	\N	Argentina	\N	\N	\N	mas3d	TRIAL	America/Bogota	COP	es	\N	\N	2025-12-25 23:47:32.187+00	\N	7d215269-e865-4786-b780-e198c12e8546	{"branding": {"logo": "https://res.cloudinary.com/dxfgdwmwd/image/upload/v1764114545/beauty-control/businesses/b1effc61-cd62-45fc-a942-8eb8c144a721/logos/main/cdinm1adt6rgepzlupey.png", "fontFamily": "Poppins", "accentColor": "#ffffff", "primaryColor": "#4e4b4c", "logoThumbnail": "https://res.cloudinary.com/dxfgdwmwd/image/upload/v1764114545/beauty-control/businesses/b1effc61-cd62-45fc-a942-8eb8c144a721/logos/thumbs/q1imazzalujw4luvr8i3.png", "secondaryColor": "#554ccd"}}	2025-11-25 23:47:32.187+00	2025-12-11 12:10:16.403+00
\.


--
-- Data for Name: cash_register_shifts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_register_shifts (id, business_id, user_id, branch_id, shift_number, status, opened_at, closed_at, opening_balance, expected_closing_balance, actual_closing_balance, difference, summary, opening_notes, closing_notes, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clients (id, business_id, email, "firstName", "lastName", phone, "phoneSecondary", "dateOfBirth", gender, address, city, state, "zipCode", "emergencyContact", "medicalInfo", avatar, status, preferences, tags, notes, source, "lastAppointment", "createdAt", "updatedAt") FROM stdin;
5ccd7fbb-90fc-45e9-ad47-0cd7adf4d59c	\N	dagtiso@gmail.com	Marisol	Guerra	3202142082	\N	\N	\N	\N	\N	\N	\N	{}	{"notes": "", "allergies": [], "conditions": [], "medications": []}	\N	ACTIVE	{"language": "es", "timezone": "America/Bogota", "notifications": {"sms": false, "email": true, "whatsapp": false}}	[]	\N	\N	\N	2025-12-11 01:20:06.649+00	2025-12-11 01:20:06.649+00
\.


--
-- Data for Name: commission_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.commission_details (id, "paymentRequestId", "appointmentId", "serviceId", "clientId", "serviceDate", "serviceName", "servicePrice", "commissionRate", "commissionAmount", currency, "clientName", "paymentStatus", notes, "isDisputed", "disputeReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: commission_payment_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.commission_payment_requests (id, "requestNumber", "specialistId", "businessId", "periodFrom", "periodTo", "totalAmount", currency, status, "documentUrl", "signatureUrl", "specialistNotes", "businessNotes", "rejectionReason", "submittedAt", "reviewedAt", "reviewedBy", "paidAt", "paidBy", "paymentMethod", "paymentReference", "bankAccount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: consent_signatures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.consent_signatures (id, "businessId", "consentTemplateId", "customerId", "appointmentId", "serviceId", "templateVersion", "templateContent", "signatureData", "signatureType", "signedAt", "signedBy", "editableFieldsData", "pdfUrl", "pdfGeneratedAt", "ipAddress", "userAgent", location, device, status, "revokedAt", "revokedReason", "revokedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: consent_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.consent_templates (id, "businessId", name, code, content, version, "editableFields", "pdfConfig", category, "isActive", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: financial_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.financial_movements (id, "businessId", "userId", type, category, "businessExpenseCategoryId", "businessExpenseId", amount, currency, description, notes, "paymentMethod", "transactionId", "referenceId", "referenceType", "clientId", status, "dueDate", "paidDate", "receiptUrl", "voucherUrl", "taxAmount", "taxRate", commission, "integrationData", "isRecurring", "recurringConfig", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_movements (id, "businessId", "productId", "userId", "movementType", quantity, "unitCost", "totalCost", "previousStock", "newStock", reason, notes, "referenceId", "referenceType", "batchNumber", "expirationDate", "supplierInfo", "documentUrl", branch_id, specialist_id, appointment_id, from_branch_id, to_branch_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modules (id, name, "displayName", description, icon, category, status, version, "requiresConfiguration", "configurationSchema", permissions, dependencies, pricing, "createdAt", "updatedAt") FROM stdin;
b4ff792f-5b0b-4b9c-9a03-b7ca37130322	authentication	Autenticación	Sistema de autenticación y autorización de usuarios	key	CORE	ACTIVE	1.0.0	f	\N	["auth.login", "auth.logout", "auth.reset-password"]	[]	{"type": "FREE", "price": 0, "currency": "COP"}	2025-11-24 19:41:04.374+00	2025-11-24 19:41:04.374+00
15773327-1bd7-4d25-a4a5-19965f41b50d	dashboard	Panel de Control	Dashboard principal con métricas y resúmenes	dashboard	CORE	ACTIVE	1.0.0	f	\N	["dashboard.view"]	[]	{"type": "FREE", "price": 0, "currency": "COP"}	2025-11-24 19:41:05.058+00	2025-11-24 19:41:05.058+00
922a65bb-c711-4379-8686-a69de78b391f	user-management	Gestión de Usuarios	Administración de usuarios del negocio	users	CORE	ACTIVE	1.0.0	f	\N	["users.view", "users.create", "users.edit", "users.delete"]	[]	{"type": "FREE", "price": 0, "currency": "COP"}	2025-11-24 19:41:05.719+00	2025-11-24 19:41:05.719+00
76cba9e4-1a1b-43e4-a602-62054ede3986	multi_branch	Múltiples Sucursales	Permite gestionar más de una sucursal en un mismo negocio	map-pin	CORE	ACTIVE	1.0.0	t	{"type": "object", "properties": {"maxBranches": {"type": "number", "default": 1}}}	["branches.view", "branches.create", "branches.edit", "branches.delete"]	[]	{"type": "PREMIUM", "price": 45000, "currency": "COP"}	2025-11-24 19:41:06.39+00	2025-11-24 19:41:06.39+00
c4851d88-1947-4fa1-b0e1-813e39d460b0	appointment-booking	Reserva de Citas	Sistema de reserva y gestión de citas básico	calendar	APPOINTMENTS	ACTIVE	1.0.0	t	{"type": "object", "properties": {"advanceBookingDays": {"type": "number", "default": 30}, "allowOnlineBooking": {"type": "boolean", "default": true}, "requiresConfirmation": {"type": "boolean", "default": false}}}	["appointments.view", "appointments.create", "appointments.edit", "appointments.cancel"]	[]	{"type": "FREE", "price": 0, "currency": "COP"}	2025-11-24 19:41:07.051+00	2025-11-24 19:41:07.051+00
972d00ad-ec64-43df-b452-03be6b9b441c	appointment-reminders	Recordatorios de Citas	Envío automático de recordatorios por WhatsApp/SMS	bell	APPOINTMENTS	ACTIVE	1.0.0	t	{"type": "object", "properties": {"smsReminders": {"type": "boolean", "default": false}, "whatsappReminders": {"type": "boolean", "default": true}, "reminderHoursBefore": {"type": "number", "default": 24}}}	["reminders.configure", "reminders.send"]	[]	{"type": "PREMIUM", "price": 25000, "currency": "COP"}	2025-11-24 19:41:07.719+00	2025-11-24 19:41:07.719+00
1713d717-3e0b-4c03-922a-e122c0a9c01d	inventory	Inventario	Gestión de stock de insumos y productos vendibles, incluyendo proveedores	box	INVENTORY	ACTIVE	1.0.0	f	\N	["inventory.view", "inventory.create", "inventory.edit", "inventory.delete", "suppliers.manage"]	[]	{"type": "BASIC", "price": 20000, "currency": "COP"}	2025-11-24 19:41:08.384+00	2025-11-24 19:41:08.384+00
087f8219-bb37-4838-ab10-5e6b8c3450e0	stock-control	Control de Stock	Seguimiento de existencias y alertas de stock bajo	trending-down	INVENTORY	ACTIVE	1.0.0	t	{"type": "object", "properties": {"lowStockAlert": {"type": "boolean", "default": true}, "minimumStockLevel": {"type": "number", "default": 5}, "autoReorderEnabled": {"type": "boolean", "default": false}}}	["stock.view", "stock.adjust", "alerts.configure"]	["inventory"]	{"type": "PREMIUM", "price": 30000, "currency": "COP"}	2025-11-24 19:41:09.045+00	2025-11-24 19:41:09.045+00
c11d3f1b-2474-4737-bac8-f4372274b33e	basic-payments	Pagos Básicos	Procesamiento básico de pagos en efectivo	dollar-sign	PAYMENTS	ACTIVE	1.0.0	f	\N	["payments.process", "payments.view"]	[]	{"type": "FREE", "price": 0, "currency": "COP"}	2025-11-24 19:41:09.707+00	2025-11-24 19:41:09.707+00
f579b835-0ba0-44ce-b7ac-3d26f693e135	wompi_integration	Integración Wompi	Pagos en línea a través de Wompi (tarjetas y PSE)	credit-card	INTEGRATIONS	ACTIVE	1.0.0	t	{"type": "object", "properties": {"enablePSE": {"type": "boolean", "default": true}, "publicKey": {"type": "string", "default": ""}, "privateKey": {"type": "string", "default": ""}, "webhookUrl": {"type": "string", "default": ""}, "enableCards": {"type": "boolean", "default": true}, "environment": {"type": "string", "default": "sandbox"}}}	["payments.wompi", "integrations.configure"]	[]	{"type": "PREMIUM", "price": 35000, "currency": "COP"}	2025-11-24 19:41:10.382+00	2025-11-24 19:41:10.382+00
671c8004-ad9e-4a2e-8492-f504fb1f5d92	taxxa_integration	Integración Taxxa	Facturación electrónica con Taxxa	file-text	INTEGRATIONS	ACTIVE	1.0.0	t	{"type": "object", "properties": {"apiKey": {"type": "string", "default": ""}, "companyId": {"type": "string", "default": ""}, "environment": {"type": "string", "default": "test"}, "invoiceTemplate": {"type": "string", "default": "standard"}, "autoGenerateInvoice": {"type": "boolean", "default": false}}}	["invoicing.taxxa", "integrations.configure"]	[]	{"type": "PREMIUM", "price": 25000, "currency": "COP"}	2025-11-24 19:41:11.043+00	2025-11-24 19:41:11.043+00
5d44a62a-dc78-48dc-902a-9a104c80562b	expenses	Control de Gastos	Registro y categorización de gastos del negocio	dollar-sign	REPORTS	ACTIVE	1.0.0	f	\N	["expenses.view", "expenses.create", "expenses.edit", "expenses.delete"]	[]	{"type": "BASIC", "price": 15000, "currency": "COP"}	2025-11-24 19:41:11.715+00	2025-11-24 19:41:11.715+00
9352e2c2-5183-4150-a493-b567f255c24a	balance	Balance General	Reporte financiero completo del negocio	bar-chart-2	REPORTS	ACTIVE	1.0.0	f	\N	["balance.view", "reports.financial"]	["expenses", "basic-payments"]	{"type": "BASIC", "price": 18000, "currency": "COP"}	2025-11-24 19:41:12.37+00	2025-11-24 19:41:12.37+00
4fd5171d-d032-463b-940b-9175b08d9e7b	client_history	Historial de Clientes	Turnos cumplidos, cancelados y procedimientos realizados	users	ANALYTICS	ACTIVE	1.0.0	f	\N	["clients.history", "analytics.view"]	["appointment-booking"]	{"type": "BASIC", "price": 12000, "currency": "COP"}	2025-11-24 19:41:13.02+00	2025-11-24 19:41:13.02+00
2357b5c7-2349-4b0b-aeb9-e5c9c8e1953b	advanced-analytics	Análisis Avanzado	Análisis avanzado con gráficos y métricas detalladas	bar-chart	ANALYTICS	ACTIVE	1.0.0	t	{"type": "object", "properties": {"reportFrequency": {"type": "string", "default": "weekly"}, "includeComparisons": {"type": "boolean", "default": true}, "autoGenerateReports": {"type": "boolean", "default": false}}}	["analytics.view", "analytics.configure"]	["client_history", "balance"]	{"type": "PREMIUM", "price": 40000, "currency": "COP"}	2025-11-24 19:41:13.679+00	2025-11-24 19:41:13.679+00
\.


--
-- Data for Name: owner_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.owner_expenses (id, description, amount, currency, category, subcategory, "expenseDate", "dueDate", vendor, "vendorTaxId", "vendorEmail", "receiptUrl", "receiptPublicId", "receiptType", "receiptOriginalName", status, "approvedBy", "approvedAt", "rejectionReason", "taxAmount", "taxRate", "isRecurring", "recurringFrequency", notes, "internalReference", "projectCode", "isActive", "createdBy", "updatedBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: owner_financial_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.owner_financial_reports (id, "reportType", "reportPeriod", "startDate", "endDate", "totalRevenue", "subscriptionRevenue", "netRevenue", "totalPayments", "completedPayments", "failedPayments", "pendingPayments", "refundedPayments", "totalCommissions", "averageCommissionRate", "newSubscriptions", "renewedSubscriptions", "canceledSubscriptions", "activeSubscriptions", "revenueByPlan", "subscriptionsByPlan", "revenueByPaymentMethod", "paymentsByMethod", "averageRevenuePerBusiness", "churnRate", "retentionRate", "previousPeriodComparison", "yearOverYearGrowth", currency, "generatedAt", "generatedBy", status, notes, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: owner_payment_configurations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.owner_payment_configurations (id, provider, name, "isActive", "isDefault", environment, configuration, credentials, "webhookUrl", "webhookSecret", "supportedCurrencies", "commissionRate", "fixedFee", "maxAmount", "minAmount", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, "userId", token, "tokenHash", "expiresAt", "isUsed", "usedAt", "ipAddress", "userAgent", "requestedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payment_integrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_integrations (id, "businessId", provider, name, "isActive", "isDefault", environment, configuration, credentials, "supportedMethods", fees, limits, "webhookUrl", "webhookSecret", "lastSync", status, "errorMessage", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: plan_modules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plan_modules (id, "subscriptionPlanId", "moduleId", "isIncluded", "limitQuantity", "additionalPrice", configuration, "createdAt", "updatedAt") FROM stdin;
b2573a6f-c65f-40e0-aa08-041e5a154442	e3209392-2b42-4621-b197-f0e44c439067	b4ff792f-5b0b-4b9c-9a03-b7ca37130322	t	\N	0.00	{}	2025-11-24 19:43:40.428+00	2025-11-24 19:43:40.428+00
b6ddfb0c-5685-489a-bb59-32fffc2ba1fc	e3209392-2b42-4621-b197-f0e44c439067	15773327-1bd7-4d25-a4a5-19965f41b50d	t	\N	0.00	{}	2025-11-24 19:43:40.428+00	2025-11-24 19:43:40.428+00
55fc7b9f-0ca2-49cd-8cfd-99e04589e398	e3209392-2b42-4621-b197-f0e44c439067	922a65bb-c711-4379-8686-a69de78b391f	t	\N	0.00	{}	2025-11-24 19:43:40.428+00	2025-11-24 19:43:40.428+00
abb9aece-09c3-4721-8ddb-f8dce1de9eb7	e3209392-2b42-4621-b197-f0e44c439067	c4851d88-1947-4fa1-b0e1-813e39d460b0	t	\N	0.00	{}	2025-11-24 19:43:40.428+00	2025-11-24 19:43:40.428+00
40ead94b-f5a2-49b7-9b66-d9bbfa10e533	e3209392-2b42-4621-b197-f0e44c439067	c11d3f1b-2474-4737-bac8-f4372274b33e	t	\N	0.00	{}	2025-11-24 19:43:40.428+00	2025-11-24 19:43:40.428+00
8ac4ad58-b92c-41a1-b9ca-06df7617c762	7d215269-e865-4786-b780-e198c12e8546	b4ff792f-5b0b-4b9c-9a03-b7ca37130322	t	\N	0.00	{}	2025-11-24 19:43:41.276+00	2025-11-24 19:43:41.276+00
44084c4d-08d3-4b68-915f-0b0c169201b4	7d215269-e865-4786-b780-e198c12e8546	15773327-1bd7-4d25-a4a5-19965f41b50d	t	\N	0.00	{}	2025-11-24 19:43:41.276+00	2025-11-24 19:43:41.276+00
c29f4a47-1824-4103-b5eb-d7e9662a2b78	7d215269-e865-4786-b780-e198c12e8546	922a65bb-c711-4379-8686-a69de78b391f	t	\N	0.00	{}	2025-11-24 19:43:41.276+00	2025-11-24 19:43:41.276+00
0da9b234-dcc7-4bfc-9c54-a9fceb81772f	7d215269-e865-4786-b780-e198c12e8546	c4851d88-1947-4fa1-b0e1-813e39d460b0	t	\N	0.00	{}	2025-11-24 19:43:41.276+00	2025-11-24 19:43:41.276+00
7b33e510-d625-448e-8ead-8b38372f8ace	7d215269-e865-4786-b780-e198c12e8546	972d00ad-ec64-43df-b452-03be6b9b441c	t	\N	0.00	{}	2025-11-24 19:43:41.276+00	2025-11-24 19:43:41.276+00
ee071d25-280f-439e-b399-d4dac20643cc	7d215269-e865-4786-b780-e198c12e8546	1713d717-3e0b-4c03-922a-e122c0a9c01d	t	\N	0.00	{}	2025-11-24 19:43:41.276+00	2025-11-24 19:43:41.276+00
eb369cb3-7db2-4caf-a716-5dffc64f336c	7d215269-e865-4786-b780-e198c12e8546	c11d3f1b-2474-4737-bac8-f4372274b33e	t	\N	0.00	{}	2025-11-24 19:43:41.276+00	2025-11-24 19:43:41.276+00
3f929f72-62ce-45d4-be19-890c97223bfa	7d215269-e865-4786-b780-e198c12e8546	5d44a62a-dc78-48dc-902a-9a104c80562b	t	\N	0.00	{}	2025-11-24 19:43:41.276+00	2025-11-24 19:43:41.276+00
eba1e629-f9a7-4903-afc5-3bdc43ecd4e3	7d215269-e865-4786-b780-e198c12e8546	4fd5171d-d032-463b-940b-9175b08d9e7b	t	\N	0.00	{}	2025-11-24 19:43:41.276+00	2025-11-24 19:43:41.276+00
05667110-e0a3-4fcf-a8ae-54b31b1da4cf	5b2ea35c-213a-4581-8ab5-554156b3fc2a	b4ff792f-5b0b-4b9c-9a03-b7ca37130322	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
6e6cd5cb-3f66-4d96-a0c9-94caa958c694	5b2ea35c-213a-4581-8ab5-554156b3fc2a	15773327-1bd7-4d25-a4a5-19965f41b50d	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
5ea8da95-e128-4948-a510-43a598e47a2e	5b2ea35c-213a-4581-8ab5-554156b3fc2a	922a65bb-c711-4379-8686-a69de78b391f	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
cde24be9-b424-436d-83f0-8a1ec0700107	5b2ea35c-213a-4581-8ab5-554156b3fc2a	c4851d88-1947-4fa1-b0e1-813e39d460b0	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
2adccf5d-bad1-4fd6-9cb3-f8b40998e5a6	5b2ea35c-213a-4581-8ab5-554156b3fc2a	972d00ad-ec64-43df-b452-03be6b9b441c	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
2b1fad06-3491-43a7-9763-7700e96db181	5b2ea35c-213a-4581-8ab5-554156b3fc2a	1713d717-3e0b-4c03-922a-e122c0a9c01d	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
cf5d550d-ccda-4a8e-87ca-f16044ee8284	5b2ea35c-213a-4581-8ab5-554156b3fc2a	087f8219-bb37-4838-ab10-5e6b8c3450e0	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
c5aaec14-6e5f-4487-8d6e-e2387ed56daf	5b2ea35c-213a-4581-8ab5-554156b3fc2a	c11d3f1b-2474-4737-bac8-f4372274b33e	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
468adb97-8c5a-487c-8c9a-9a644a3b3382	5b2ea35c-213a-4581-8ab5-554156b3fc2a	f579b835-0ba0-44ce-b7ac-3d26f693e135	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
122f0fba-82cc-476e-b186-4677b0e1c744	5b2ea35c-213a-4581-8ab5-554156b3fc2a	671c8004-ad9e-4a2e-8492-f504fb1f5d92	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
736758b3-8f31-40a7-99e8-37b80c3e42a4	5b2ea35c-213a-4581-8ab5-554156b3fc2a	5d44a62a-dc78-48dc-902a-9a104c80562b	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
1be0f513-7b69-4db1-8193-f2a5f7e8313e	5b2ea35c-213a-4581-8ab5-554156b3fc2a	9352e2c2-5183-4150-a493-b567f255c24a	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
7dd206bd-3f79-483a-bd73-31956a6bcda5	5b2ea35c-213a-4581-8ab5-554156b3fc2a	4fd5171d-d032-463b-940b-9175b08d9e7b	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
748e835b-f8ba-43e8-902b-0e2864f63b05	5b2ea35c-213a-4581-8ab5-554156b3fc2a	2357b5c7-2349-4b0b-aeb9-e5c9c8e1953b	t	\N	0.00	{}	2025-11-24 19:43:43.115+00	2025-11-24 19:43:43.115+00
5a51709e-06bc-4975-a3bf-20d169358ef3	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	b4ff792f-5b0b-4b9c-9a03-b7ca37130322	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
3da61733-a2be-4fbe-bdf1-df38be0c1aa6	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	15773327-1bd7-4d25-a4a5-19965f41b50d	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
bbad4d38-845d-49a0-a703-63e5bff3ec83	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	922a65bb-c711-4379-8686-a69de78b391f	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
36975093-bcbb-438b-bf34-daa4f72eb7c5	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	76cba9e4-1a1b-43e4-a602-62054ede3986	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
01570ef2-66c9-4e7a-af02-31ff8aece4a2	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	c4851d88-1947-4fa1-b0e1-813e39d460b0	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
2239f24a-ed58-41fe-950c-0e177d381b98	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	972d00ad-ec64-43df-b452-03be6b9b441c	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
6aae50ab-25cd-48ff-8420-cbb7fc554c87	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	1713d717-3e0b-4c03-922a-e122c0a9c01d	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
5214b217-94f1-46c5-aa40-a87081fbe52e	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	087f8219-bb37-4838-ab10-5e6b8c3450e0	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
517cd95b-cfdc-4f86-9d66-12580e757b2c	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	c11d3f1b-2474-4737-bac8-f4372274b33e	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
87664239-6ff8-443e-9f6f-6144fadebf7e	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	f579b835-0ba0-44ce-b7ac-3d26f693e135	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
273112c6-5d00-4673-a328-55d7544a0a41	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	671c8004-ad9e-4a2e-8492-f504fb1f5d92	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
1f6d3ad8-ef5d-4cd8-b9a8-27a2ee7767d7	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	5d44a62a-dc78-48dc-902a-9a104c80562b	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
f3f20f56-ea6c-48ed-aced-dcb1c22b6d0c	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	9352e2c2-5183-4150-a493-b567f255c24a	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
577bc10a-67dd-4f51-8ae0-caa5db564ba5	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	4fd5171d-d032-463b-940b-9175b08d9e7b	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
4f2b2e5e-3531-406f-9cb2-9cd1e8f8465c	2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	2357b5c7-2349-4b0b-aeb9-e5c9c8e1953b	t	\N	0.00	{}	2025-11-24 19:43:43.946+00	2025-11-24 19:43:43.946+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, "businessId", name, description, sku, barcode, category, brand, price, cost, "isActive", "trackInventory", "currentStock", "minStock", "maxStock", unit, weight, dimensions, images, taxable, "taxRate", supplier, tags, variants, "expirationTracking", "batchTracking", "serialTracking", product_type, requires_specialist_tracking, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: rule_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rule_templates (id, key, type, "defaultValue", description, category, "allowCustomization", version, "isActive", "validationRules", examples, required_module, "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
9aa75606-d720-4442-9d26-4d69b79f14c4	CITAS_HORAS_CANCELACION	NUMBER	24	Horas de anticipación para cancelar sin penalización	CANCELLATION_POLICY	t	1.0.0	t	{"max": 168, "min": 0, "type": "integer"}	{"values": [2, 4, 12, 24, 48], "descriptions": ["2 horas", "4 horas", "12 horas", "1 día", "2 días"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:33.396+00	2025-11-24 19:41:33.396+00
d720b08f-53ea-4330-a735-2797bdfcee08	CITAS_MAXIMAS_POR_DIA	NUMBER	10	Número máximo de citas por cliente al día	BOOKING_POLICY	t	1.0.0	t	{"max": 50, "min": 1, "type": "integer"}	{"values": [1, 3, 5, 10, 20], "descriptions": ["Solo 1 cita", "3 citas", "5 citas", "10 citas", "Hasta 20 citas"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:34.072+00	2025-11-24 19:41:34.072+00
c9e72243-c380-44ea-a712-02e8dbd26a2d	CITAS_RECORDATORIOS_ACTIVADOS	BOOLEAN	true	Activar recordatorios automáticos de citas	NOTIFICATION_POLICY	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Recordatorios activados", "Sin recordatorios"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:34.727+00	2025-11-24 19:41:34.727+00
43855097-b4cd-4518-85a2-fa041b73ee55	CITAS_HORAS_RECORDATORIO	NUMBER	24	Horas de anticipación para enviar recordatorios	NOTIFICATION_POLICY	t	1.0.0	t	{"max": 168, "min": 1, "type": "integer"}	{"values": [2, 4, 12, 24, 48], "descriptions": ["2 horas antes", "4 horas antes", "12 horas antes", "1 día antes", "2 días antes"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:35.383+00	2025-11-24 19:41:35.383+00
46d280b6-3630-448d-803f-813fce2b3b19	CITAS_PERMITIR_SIMULTANEAS	BOOLEAN	false	Permitir citas simultáneas con diferentes especialistas	BOOKING_POLICY	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Permitir citas simultáneas", "Solo una cita a la vez"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:36.055+00	2025-11-24 19:41:36.055+00
00a4835f-190a-42b0-aff2-2a9784262737	REQUIRE_CONSENT_FOR_COMPLETION	BOOLEAN	false	Requiere consentimiento informado firmado antes de completar cualquier cita	APPOINTMENT	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Consentimiento obligatorio", "Consentimiento opcional"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:36.711+00	2025-11-24 19:41:36.711+00
35df1b9c-38cb-482f-a512-dfe1b8078cca	REQUIRE_BEFORE_PHOTO	BOOLEAN	false	Requiere foto "antes" del procedimiento para completar cita	APPOINTMENT	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Foto antes obligatoria", "Foto antes opcional"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:37.359+00	2025-11-24 19:41:37.359+00
10e37a4f-372a-438c-8955-d1456ff0d204	REQUIRE_AFTER_PHOTO	BOOLEAN	false	Requiere foto "después" del procedimiento para completar cita	APPOINTMENT	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Foto después obligatoria", "Foto después opcional"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:38.012+00	2025-11-24 19:41:38.012+00
a0925440-5e2f-429a-8785-744776d49722	REQUIRE_BOTH_PHOTOS	BOOLEAN	false	Requiere fotos antes y después del procedimiento para completar cita	APPOINTMENT	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Ambas fotos obligatorias", "Fotos opcionales"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:38.675+00	2025-11-24 19:41:38.675+00
880804ee-0572-47e5-a2a2-d841cec5697f	REQUIRE_FULL_PAYMENT	BOOLEAN	false	Requiere pago completo antes de completar cita	PAYMENT	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Pago completo obligatorio", "Pago completo opcional"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:39.321+00	2025-11-24 19:41:39.321+00
8e518c39-368c-4821-bb9a-7ea672c75095	REQUIRE_MINIMUM_PAYMENT	NUMBER	50	Porcentaje mínimo de pago requerido para completar cita (0-100)	PAYMENT	t	1.0.0	t	{"max": 100, "min": 0, "type": "number"}	{"values": [0, 30, 50, 70, 100], "descriptions": ["Sin mínimo", "30% mínimo", "50% mínimo", "70% mínimo", "Pago completo"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:39.975+00	2025-11-24 19:41:39.975+00
e69e7851-171b-4461-9ad0-0923e486030e	MINIMUM_DURATION	NUMBER	30	Duración mínima de la cita en minutos (genera warning si es menor)	TIME	t	1.0.0	t	{"max": 480, "min": 5, "type": "integer"}	{"values": [15, 30, 45, 60, 90], "descriptions": ["15 minutos", "30 minutos", "45 minutos", "1 hora", "1.5 horas"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:40.632+00	2025-11-24 19:41:40.632+00
53769dd3-b45d-43cd-a5de-39b5e2ac6712	MAXIMUM_DURATION	NUMBER	240	Duración máxima de la cita en minutos (genera warning si es mayor)	TIME	t	1.0.0	t	{"max": 960, "min": 30, "type": "integer"}	{"values": [60, 120, 180, 240, 480], "descriptions": ["1 hora", "2 horas", "3 horas", "4 horas", "8 horas"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:41.288+00	2025-11-24 19:41:41.288+00
c1a0ce07-dad5-4477-8eb2-c2614b5311ee	REQUIRE_CLIENT_SIGNATURE	BOOLEAN	false	Requiere firma adicional del cliente al completar cita	APPOINTMENT	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Firma obligatoria", "Sin firma requerida"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:41.948+00	2025-11-24 19:41:41.948+00
054f8345-4222-4d93-a27a-6713c9db5c55	REQUIRE_CLIENT_FEEDBACK	BOOLEAN	false	Requiere feedback del cliente antes de completar cita	APPOINTMENT	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Feedback obligatorio", "Feedback opcional"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:42.599+00	2025-11-24 19:41:42.599+00
1cd402de-2b3b-4f87-b910-635a71400736	CITAS_HORAS_VOUCHER_CANCELACION	NUMBER	24	Horas mínimas de anticipación para generar voucher al cancelar	CANCELLATION_POLICY	t	1.0.0	t	{"max": 168, "min": 0, "type": "integer"}	{"values": [2, 4, 12, 24, 48], "descriptions": ["2 horas antes", "4 horas antes", "12 horas antes", "24 horas antes", "48 horas antes"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:43.253+00	2025-11-24 19:41:43.253+00
3af9bc78-ff1f-4965-9b1e-121aa72c6c44	CITAS_VOUCHER_VALIDEZ_DIAS	NUMBER	30	Días de validez del voucher generado por cancelación	CANCELLATION_POLICY	t	1.0.0	t	{"max": 365, "min": 7, "type": "integer"}	{"values": [7, 15, 30, 60, 90], "descriptions": ["1 semana", "2 semanas", "1 mes", "2 meses", "3 meses"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:43.92+00	2025-11-24 19:41:43.92+00
90c774e1-9f9c-46a6-90d6-2c48a3dd4440	CITAS_VOUCHER_PORCENTAJE_VALOR	NUMBER	100	Porcentaje del valor de la cita que se convierte en voucher	CANCELLATION_POLICY	t	1.0.0	t	{"max": 100, "min": 0, "type": "number"}	{"values": [50, 75, 100], "descriptions": ["50% del valor", "75% del valor", "100% del valor"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:44.579+00	2025-11-24 19:41:44.579+00
a0d50647-5540-408d-bc1c-b8ff372edec0	CITAS_MAX_CANCELACIONES_PERMITIDAS	NUMBER	3	Número máximo de cancelaciones antes de bloquear acceso a agenda	CANCELLATION_POLICY	t	1.0.0	t	{"max": 10, "min": 1, "type": "integer"}	{"values": [2, 3, 5, 7, 10], "descriptions": ["2 cancelaciones", "3 cancelaciones", "5 cancelaciones", "7 cancelaciones", "10 cancelaciones"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:45.225+00	2025-11-24 19:41:45.225+00
049c7f50-ff96-4d9e-9896-d5535047f1d2	CITAS_PERIODO_RESETEO_CANCELACIONES	NUMBER	30	Días después de los cuales se resetea el contador de cancelaciones	CANCELLATION_POLICY	t	1.0.0	t	{"max": 365, "min": 7, "type": "integer"}	{"values": [7, 15, 30, 60, 90], "descriptions": ["1 semana", "2 semanas", "1 mes", "2 meses", "3 meses"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:45.881+00	2025-11-24 19:41:45.881+00
77b08ea2-4e23-4c73-ada4-dae9a55693fb	CITAS_BLOQUEO_TEMPORAL_DIAS	NUMBER	15	Días de bloqueo temporal tras exceder cancelaciones permitidas	CANCELLATION_POLICY	t	1.0.0	t	{"max": 90, "min": 1, "type": "integer"}	{"values": [7, 15, 30, 60, 90], "descriptions": ["1 semana", "2 semanas", "1 mes", "2 meses", "3 meses"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:46.537+00	2025-11-24 19:41:46.537+00
969d2980-b65a-4469-b471-9f8d2b9c1ea2	CITAS_NOTIFICAR_VOUCHER_EMAIL	BOOLEAN	true	Enviar email con código de voucher al generarse	NOTIFICATION_POLICY	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Notificar por email", "Sin notificación"]}	gestion_de_turnos	\N	\N	2025-11-24 19:41:47.205+00	2025-11-24 19:41:47.205+00
4ac8df95-c60a-415f-aa64-c1d1594720d2	FACTURA_GENERACION_AUTOMATICA	BOOLEAN	true	Generar facturas automáticamente al completar servicios	SERVICE_POLICY	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Facturación automática", "Facturación manual"]}	facturacion_electronica	\N	\N	2025-11-24 19:41:47.896+00	2025-11-24 19:41:47.896+00
880e158a-8041-4c08-8eaa-81fc0a51bd3c	FACTURA_ENVIAR_EMAIL	BOOLEAN	true	Enviar facturas por correo electrónico automáticamente	NOTIFICATION_POLICY	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Envío automático", "Envío manual"]}	facturacion_electronica	\N	\N	2025-11-24 19:41:48.558+00	2025-11-24 19:41:48.558+00
c4c91421-f333-41f0-acf5-4ce7f1f9f321	PAGO_ACEPTAR_EFECTIVO	BOOLEAN	true	Aceptar pagos en efectivo	PAYMENT_POLICY	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Acepta efectivo", "Solo digital"]}	\N	\N	\N	2025-11-24 19:41:49.212+00	2025-11-24 19:41:49.212+00
b8cfac5e-5a2a-4593-99ad-bfca78cb6321	PAGO_ACEPTAR_TARJETA	BOOLEAN	true	Aceptar pagos con tarjeta de crédito/débito	PAYMENT_POLICY	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Acepta tarjetas", "Sin tarjetas"]}	\N	\N	\N	2025-11-24 19:41:49.879+00	2025-11-24 19:41:49.879+00
71e9cf86-23b8-40c4-a8d4-86de03ac0a99	COMISIONES_HABILITADAS	BOOLEAN	true	¿En tu negocio se manejan comisiones para especialistas?	SERVICE_POLICY	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Negocio con comisiones", "Negocio sin comisiones (empleados con salario fijo)"]}	\N	\N	\N	2025-11-24 19:41:50.533+00	2025-11-24 19:41:50.533+00
8ff4e8c8-2b0a-495a-b1e6-18889344bd05	COMISIONES_TIPO_CALCULO	STRING	"POR_SERVICIO"	Tipo de cálculo de comisiones para especialistas	SERVICE_POLICY	t	1.0.0	t	{"enum": ["GENERAL", "POR_SERVICIO", "MIXTO"]}	{"values": ["GENERAL", "POR_SERVICIO", "MIXTO"], "descriptions": ["Mismo % para todos los servicios", "Cada servicio tiene su propio %", "Algunos servicios usan % general, otros personalizados"]}	\N	\N	\N	2025-11-24 19:41:51.206+00	2025-11-24 19:41:51.206+00
77093c80-a022-4c79-a641-e6e2e9bcbcb9	COMISIONES_PORCENTAJE_GENERAL	NUMBER	50	Porcentaje de comisión general para especialistas (%)	SERVICE_POLICY	t	1.0.0	t	{"max": 100, "min": 0, "step": 0.5, "type": "decimal"}	{"values": [30, 40, 50, 60, 70], "descriptions": ["30% especialista", "40% especialista", "50/50", "60% especialista", "70% especialista"]}	\N	\N	\N	2025-11-24 19:41:51.861+00	2025-11-24 19:41:51.861+00
bb5f9076-46ab-4804-aa1d-3154708e5021	DEVOLUCION_PERMITIR	BOOLEAN	true	Permitir devoluciones y reembolsos	REFUND_POLICY	t	1.0.0	t	\N	{"values": [true, false], "descriptions": ["Permite devoluciones", "Sin devoluciones"]}	\N	\N	\N	2025-11-24 19:41:52.511+00	2025-11-24 19:41:52.511+00
c3fe541a-38c4-4474-91cb-3e36b1987d57	DEVOLUCION_PLAZO_DIAS	NUMBER	7	Días límite para solicitar devoluciones	REFUND_POLICY	t	1.0.0	t	{"max": 365, "min": 1, "type": "integer"}	{"values": [3, 7, 15, 30, 90], "descriptions": ["3 días", "1 semana", "2 semanas", "1 mes", "3 meses"]}	\N	\N	\N	2025-11-24 19:41:53.16+00	2025-11-24 19:41:53.16+00
\.


--
-- Data for Name: service_commissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_commissions (id, "serviceId", type, "specialistPercentage", "businessPercentage", "fixedAmount", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, "businessId", name, description, category, price, duration, "requiresConsent", "consentTemplateId", "isActive", color, "preparationTime", "cleanupTime", "maxConcurrent", "requiresEquipment", "skillsRequired", images, "bookingSettings", tags, "isPackage", "packageType", "packageConfig", "totalPrice", "allowPartialPayment", "pricePerSession", "createdAt", "updatedAt") FROM stdin;
2636bfa5-e118-4dd5-b258-025272b87001	cd19320e-8f65-4e05-ab2c-aac7024bf8c3	tratamiento facial	limpieza facial profunda	tratamiento facial	250000.00	45	t	\N	t	#5af73b	15	15	1	[]	[]	["https://res.cloudinary.com/dxfgdwmwd/image/upload/v1764078949/beauty-control/businesses/cd19320e-8f65-4e05-ab2c-aac7024bf8c3/services/2636bfa5-e118-4dd5-b258-025272b87001/main/gpht4oxzedohsq5x7lex.jpg"]	{"allowWaitlist": true, "requiresApproval": false, "advanceBookingDays": 30, "onlineBookingEnabled": true}	[]	t	WITH_MAINTENANCE	{"pricing": {"discount": 0, "perSession": "", "mainSession": "100000", "maintenancePrice": "50000"}, "sessions": null, "description": null, "sessionInterval": null, "maintenanceInterval": 30, "maintenanceSessions": 3}	250000.00	t	\N	2025-11-25 13:55:48.497+00	2025-11-25 13:55:51.27+00
\.


--
-- Data for Name: specialist_branch_schedules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.specialist_branch_schedules (id, "specialistId", "branchId", "dayOfWeek", "startTime", "endTime", "isActive", priority, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: specialist_commissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.specialist_commissions (id, "specialistId", "businessId", "serviceId", "commissionType", "commissionValue", currency, "paymentFrequency", "paymentDay", "minimumAmount", "isActive", "effectiveFrom", "effectiveTo", notes, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: specialist_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.specialist_documents (id, "specialistId", "businessId", "documentType", "fileName", "originalName", "fileUrl", "mimeType", "fileSize", "uploadedBy", status, notes, "approvedBy", "approvedAt", "rejectionReason", "expirationDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: specialist_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.specialist_profiles (id, "userId", "businessId", specialization, biography, experience, certifications, "profileImage", "isActive", "commissionRate", "commissionType", "fixedCommissionAmount", "workingDays", "workingHours", "customSchedule", "breakTime", skills, languages, rating, "totalReviews", "phoneExtension", "emergencyContact", "socialMedia", preferences, status, "hireDate", "contractType", notes, "createdAt", "updatedAt") FROM stdin;
ff06a9e6-894e-4a81-8606-9078c661b5bc	2c0a99de-8d84-448b-a17f-a38d5edb54e8	cd19320e-8f65-4e05-ab2c-aac7024bf8c3	\N	soy diana especialista en manos y piel	3	["piel", "manos"]	\N	t	50.00	PERCENTAGE	\N	{"friday": true, "monday": true, "sunday": false, "tuesday": true, "saturday": true, "thursday": true, "wednesday": true}	{"end": "18:00", "start": "09:00"}	\N	{"end": "13:00", "start": "12:00", "enabled": true}	[]	["es"]	\N	0	\N	\N	\N	{"allowBookingNotifications": true, "allowReminderNotifications": true, "allowPromotionNotifications": false, "preferredNotificationMethod": "email"}	ACTIVE	\N	EMPLOYEE	\N	2025-11-25 13:46:35.325+00	2025-11-25 13:46:35.325+00
\.


--
-- Data for Name: specialist_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.specialist_services (id, "specialistId", "serviceId", "customPrice", "isActive", "skillLevel", "averageDuration", "commissionPercentage", "canBeBooked", "requiresApproval", "maxBookingsPerDay", "assignedAt", "assignedBy", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: subscription_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscription_payments (id, "businessSubscriptionId", "paymentConfigurationId", amount, currency, status, "paymentMethod", "transactionId", "externalReference", "paidAt", "dueDate", "receiptUrl", "receiptPublicId", "receiptMetadata", "receiptUploadedBy", "receiptUploadedAt", "commissionFee", "netAmount", description, notes, "failureReason", "refundReason", "refundedAmount", "refundedAt", "providerResponse", metadata, "paymentSourceToken", "isThreeDsEnabled", "threeDsAuthData", "browserInfo", "threeDsAuthType", "threeDsMethodData", "currentStep", "currentStepStatus", "isRecurringPayment", "originalPaymentId", "recurringType", "autoRenewalEnabled", "paymentAttempts", "lastAttemptAt", "maxAttempts", "attemptHistory", "createdAt", "updatedAt") FROM stdin;
6ef145a9-a65e-460d-ae92-a00544b8d587	d04bc2eb-1a1f-4cd1-9b03-251c3fa076c6	\N	24990000.00	COP	APPROVED	WOMPI_3DS	158187-1764077278-67538	\N	\N	2025-11-26 13:27:58.77+00	\N	\N	{}	\N	\N	0.00	24990000.00	\N	\N	\N	\N	0.00	\N	{}	{"type": "PUBLIC_REGISTRATION", "user": {"id": "b4725463-9a0a-4a67-8736-51e79a5727d1", "role": "BUSINESS", "email": "gardel1129@hotmail.com", "lastName": "ALZA", "firstName": "JULIANA"}, "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiNDcyNTQ2My05YTBhLTRhNjctODczNi01MWU3OWE1NzI3ZDEiLCJidXNpbmVzc0lkIjoiY2QxOTMyMGUtOGY2NS00ZTA1LWFiMmMtYWFjNzAyNGJmOGMzIiwicm9sZSI6IkJVU0lORVNTIiwiaWF0IjoxNzY0MDc3Mjk1LCJleHAiOjE3NjQxNjM2OTV9.iRZ-KcSWjXE9gbNq6ydnIdk4CWrZ3j-brpgRd4IhRLI", "business": {"id": "cd19320e-8f65-4e05-ab2c-aac7024bf8c3", "name": "luzdepiel", "email": "gardel1129@hotmail.com", "subdomain": "luzdepiel"}, "browserInfo": {"browser_tz": "300", "browser_language": "es-419", "browser_user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36", "browser_color_depth": "30", "browser_screen_width": "1680", "browser_screen_height": "1050"}, "isTemporary": true, "businessCode": "luzdepiel", "wompiReference": "BC_REGISTER_luzdepiel_1764077277524_qqy4mm", "businessCreated": true, "threeDsAuthType": "challenge_v2", "registrationData": {"userData": {"email": "gardel1129@hotmail.com", "lastName": "ALZA", "password": "Gabriel1987", "firstName": "JULIANA"}, "businessData": {"city": "Meta", "email": "gardel1129@hotmail.com", "phone": "+573247624019", "address": "Cra 43a # 26c -44 El buque Villavicencio, Colombia Fucsia insumos", "country": "Colombia", "businessCode": "luzdepiel"}}, "businessCreatedAt": "2025-11-25T13:28:15.204Z", "simulatedApproval": true, "subscriptionPlanId": "2b50fc57-d7c4-4c50-a23e-cc92ea771bf9"}	\N	f	{}	{}	\N	\N	\N	\N	f	\N	MANUAL	f	1	\N	3	[]	2025-11-25 13:27:58.772+00	2025-11-25 13:28:15.204+00
b76283d1-d37a-4d7e-8cc9-71b1672c42ea	b4cc99f8-eb8a-4156-9041-8c4e5ec05e22	\N	249900.00	COP	COMPLETED	CASH	\N	\N	2025-11-25 20:29:33.717+00	2025-11-25 20:29:33.717+00	\N	\N	{}	\N	\N	0.00	249900.00	Pago efectivo para suscripción al plan Enterprise - Ciclo: MONTHLY	Pago creado manualmente por Owner desde panel administrativo	\N	\N	0.00	\N	{}	{}	\N	f	{}	{}	\N	\N	\N	\N	f	\N	MANUAL	f	1	2025-11-25 20:29:33.717+00	1	[]	2025-11-25 20:29:33.717+00	2025-11-25 20:29:33.717+00
418b08e1-54d0-4c8f-a1d0-8fa389d1525b	a9339984-308e-4130-a5df-0f16385b4c75	\N	24990000.00	COP	APPROVED	WOMPI_3DS	158187-1764114435-69060	\N	\N	2025-11-26 23:47:16.021+00	\N	\N	{}	\N	\N	0.00	24990000.00	\N	\N	\N	\N	0.00	\N	{}	{"type": "PUBLIC_REGISTRATION", "user": {"id": "cd6660d5-8cf1-409f-acea-d54f5f07375e", "role": "BUSINESS", "email": "mercedeslobeto@gmail.com", "lastName": "Vargas", "firstName": "maria"}, "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDY2NjBkNS04Y2YxLTQwOWYtYWNlYS1kNTRmNWYwNzM3NWUiLCJidXNpbmVzc0lkIjoiYjFlZmZjNjEtY2Q2Mi00NWZjLWE5NDItOGViOGMxNDRhNzIxIiwicm9sZSI6IkJVU0lORVNTIiwiaWF0IjoxNzY0MTE0NDUyLCJleHAiOjE3NjQyMDA4NTJ9.GKezOCmdYa3E5P0y1ugIYDgGhxxsNNqd9F-uJ-HUyQs", "business": {"id": "b1effc61-cd62-45fc-a942-8eb8c144a721", "name": "mas3d", "email": "mercedeslobeto@gmail.com", "subdomain": "mas3d"}, "browserInfo": {"browser_tz": "180", "browser_language": "es-419", "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36", "browser_color_depth": "24", "browser_screen_width": "1366", "browser_screen_height": "768"}, "isTemporary": true, "businessCode": "mas3d", "wompiReference": "BC_REGISTER_mas3d_1764114434998_778w8c", "businessCreated": true, "threeDsAuthType": "challenge_v2", "registrationData": {"userData": {"email": "mercedeslobeto@gmail.com", "lastName": "Vargas", "password": "Admin*7754", "firstName": "maria"}, "businessData": {"city": "Restrepo", "email": "mercedeslobeto@gmail.com", "phone": "+573013013011", "address": "Cra 43a # 26c -44 El buque Villavicencio, Colombia Fucsia insumos", "country": "Argentina", "businessCode": "mas3d"}}, "businessCreatedAt": "2025-11-25T23:47:32.554Z", "simulatedApproval": true, "subscriptionPlanId": "2b50fc57-d7c4-4c50-a23e-cc92ea771bf9"}	\N	f	{}	{}	\N	\N	\N	\N	f	\N	MANUAL	f	1	\N	3	[]	2025-11-25 23:47:16.023+00	2025-11-25 23:47:32.555+00
a6f2ef54-d9a5-403e-b7b4-0cd1d943f2d1	960cb7bf-6fae-49ee-aade-041bb9482237	\N	249900.00	COP	PENDING	MANUAL	\N	\N	\N	2025-11-29 15:55:35.27+00	\N	\N	{}	\N	\N	0.00	249900.00	\N	Cambio de plan. Crédito aplicado: $0.00	\N	\N	0.00	\N	{}	{}	\N	f	{}	{}	\N	\N	\N	\N	f	\N	MANUAL	f	1	\N	3	[]	2025-11-29 15:55:35.481+00	2025-11-29 15:55:35.481+00
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscription_plans (id, name, description, price, "monthlyPrice", "annualPrice", "billingCycle", "annualDiscountPercent", currency, duration, "durationType", "maxUsers", "maxClients", "maxAppointments", "storageLimit", status, "isPopular", "trialDays", features, limitations, "createdAt", "updatedAt", "maxServices") FROM stdin;
5b2ea35c-213a-4581-8ab5-554156b3fc2a	Avanzado	Plan completo con pagos online (Wompi), facturación electrónica (Taxxa) y análisis avanzado. Incluye configuración asistida de integraciones. ¡Prueba GRATIS 30 días!	149900.00	\N	\N	MONTHLY	0	COP	1	MONTHS	10	5000	\N	21474836480	ACTIVE	f	30	[]	{"single_branch": "Solo 1 sucursal (multi-sucursal en Enterprise)"}	2025-11-24 19:43:42.935+00	2025-12-02 22:48:18.959+00	\N
2b50fc57-d7c4-4c50-a23e-cc92ea771bf9	Elite Empresarial	Plan empresarial para cadenas de salones. Incluye múltiples sucursales, todas las integraciones y soporte dedicado.	249900.00	\N	\N	MONTHLY	0	COP	1	MONTHS	\N	\N	\N	107374182400	ACTIVE	f	30	[]	{}	2025-11-24 19:43:43.776+00	2025-12-02 21:42:15.961+00	\N
e3209392-2b42-4621-b197-f0e44c439067	Individual	¡Gratis para siempre! Plan ideal para negocios unipersonales y emprendedores que trabajan solos. Agenda tus citas y gestiona hasta 10 procedimientos de forma simple.	1.00	\N	\N	MONTHLY	0	COP	1	MONTHS	1	50	100	524288000	ACTIVE	f	0	[]	{"unipersonal": "Solo para 1 persona (tú mismo)", "no_analytics": "Sin reportes avanzados", "no_inventory": "Sin gestión de inventario", "no_reminders": "Sin recordatorios automáticos", "limited_users": "Máximo 2 usuarios", "single_branch": "Solo 1 sucursal", "limited_clients": "Máximo 50 clientes", "no_integrations": "Sin integraciones de pago online", "limited_services": "Máximo 10 procedimientos", "limited_appointments": "Máximo 100 citas/mes"}	2025-11-24 19:43:40.23+00	2025-12-02 21:50:31.047+00	10
7d215269-e865-4786-b780-e198c12e8546	Esencial	Plan perfecto para salones en crecimiento. Incluye recordatorios automáticos, inventario y control de gastos. ¡Prueba GRATIS 15 días!	79000.00	\N	\N	MONTHLY	0	COP	1	MONTHS	2	300	500	3221225472	ACTIVE	t	10	[]	{"basic_reports": "Reportes básicos únicamente", "single_branch": "Solo 1 sucursal", "no_online_payments": "Sin pagos online"}	2025-11-24 19:43:41.11+00	2025-12-02 23:06:48.547+00	\N
\.


--
-- Data for Name: user_branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_branches (id, "userId", "branchId", "isDefault", "canManageSchedule", "canCreateAppointments", "assignedAt", "assignedBy", notes, "createdAt", "updatedAt") FROM stdin;
e47ce7f2-0141-4eeb-a93a-7751346cd2ee	2c0a99de-8d84-448b-a17f-a38d5edb54e8	185c68aa-37f6-47f1-b02f-2a0f41905df3	t	t	t	2025-11-25 13:46:35.403+00	\N	\N	2025-11-25 13:46:35.403+00	2025-11-25 13:46:35.403+00
b20ce2b1-f945-4d60-b3e7-abd905d69396	4b5609d7-9df6-49aa-b001-7a7c6cd91aef	d8f284fe-d22d-4337-a3b8-7a4413596906	t	t	t	2025-11-25 23:50:36.621+00	\N	\N	2025-11-25 23:50:36.621+00	2025-11-25 23:50:36.621+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, "firstName", "lastName", phone, role, status, avatar, "businessId", "lastLogin", "emailVerified", "emailVerificationToken", "passwordResetToken", "passwordResetExpires", "createdAt", "updatedAt") FROM stdin;
2c0a99de-8d84-448b-a17f-a38d5edb54e8	dagtiso@gmail.com	$2a$12$ijDUCCaX8qa4S7UhjEreM.10Xi3uHfnid2n5jzY2k5ec63S21ss8.	Diana	Vargas	+573502142082	SPECIALIST	ACTIVE	\N	cd19320e-8f65-4e05-ab2c-aac7024bf8c3	\N	f	\N	\N	\N	2025-11-25 13:46:35.25+00	2025-11-25 13:46:35.25+00
cd6660d5-8cf1-409f-acea-d54f5f07375e	mercedeslobeto@gmail.com	$2a$10$WARHSxhFB6frPThOb/zyXO8mvFzIUR2jsKp2lJ2GwQsVP19YIM1FK	maria	Vargas	\N	BUSINESS	ACTIVE	\N	b1effc61-cd62-45fc-a942-8eb8c144a721	2025-12-11 12:14:11.777+00	t	\N	\N	\N	2025-11-25 23:47:32.263+00	2025-12-11 12:14:11.777+00
2ab738b7-362a-4a6d-8ec7-b9eb6490e907	felixe.duran@gmail.com	$2a$12$5Nh//k/gfipOaWpngbJpLuqJubcsymFZpQovbSLj9/hylcVWMqQpi	Felix E	Duran	3108707349	BUSINESS	ACTIVE	\N	9a5a8595-767b-4723-8351-7dbdb698551e	\N	f	\N	\N	\N	2025-11-25 20:29:33.336+00	2025-11-25 20:29:33.566+00
4b5609d7-9df6-49aa-b001-7a7c6cd91aef	recept@recept.com	$2a$12$hNYJjmPndebStG3mIE61vunMpByYIh7bBrYhPf9KYZ.6oi.NKsBNG	Maria	Perez	+573013013018	RECEPTIONIST	ACTIVE	\N	b1effc61-cd62-45fc-a942-8eb8c144a721	\N	f	\N	\N	\N	2025-11-25 23:50:36.556+00	2025-11-25 23:50:36.556+00
28c186cb-074d-47af-8010-1724f9ec9f7f	huillonix@gmail.com	$2a$10$q/jj0gTYjxX9EuSFRwHVieWKzUOtM7fOI2WgiQUh6oSClSutOfYy2	Guillermo	Sarmiento	\N	BUSINESS	ACTIVE	\N	27731894-c142-4fb0-b59f-be208d0035f1	\N	t	\N	\N	\N	2025-11-29 15:10:26.331+00	2025-11-29 15:10:26.331+00
11d4c161-53da-4c7b-b5d3-5a1531e8d082	guillonix@gmail.com	$2a$10$U97qJ3oJDMt8AnHRyMPrvOINaxMukPD482pKoonKwyb9/01GRdNDO	Guillermo	Sarmiento 	\N	BUSINESS	ACTIVE	\N	b67bc737-cc58-4cf5-bc9b-03a52868cb8d	2025-11-29 15:15:33.493+00	t	\N	\N	\N	2025-11-29 15:14:55.827+00	2025-11-29 15:15:33.494+00
11cfc5a7-37c0-450a-a1f7-76b5dfe0013e	owner@owner.com	$2a$12$NBg69FjWCOhd1z4iFmVYPO8nER4ZqMDW58cmBgzemExPacYjug1ie	Diana	Vargas	+57300000000	OWNER	ACTIVE	\N	\N	2025-12-06 12:24:07.611+00	f	\N	\N	\N	2025-11-24 19:46:14.692+00	2025-12-06 12:24:07.612+00
b4725463-9a0a-4a67-8736-51e79a5727d1	gardel1129@hotmail.com	$2a$10$pfRxjnFHgxT9S13X.v5MueiIdUN2zJ2tZQfC/TDemfw0Qpp9YpKoW	JULIANA	ALZA	\N	BUSINESS	ACTIVE	\N	cd19320e-8f65-4e05-ab2c-aac7024bf8c3	2025-12-11 01:06:46.18+00	t	\N	\N	\N	2025-11-25 13:28:14.923+00	2025-12-11 01:06:46.181+00
\.


--
-- Data for Name: whatsapp_message_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_message_templates (id, business_id, template_name, language, category, body, header, footer, buttons, status, meta_template_id, rejection_reason, approved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_messages (id, business_id, client_id, appointment_id, "to", phone_number_id, message_type, payload, provider_message_id, status, error_code, error_message, sent_at, delivered_at, read_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_tokens (id, business_id, encrypted_token, token_type, expires_at, metadata, is_active, last_rotated_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_webhook_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_webhook_events (id, business_id, event_type, phone_number_id, message_id, payload, processed, processed_at, processing_error, received_at, created_at, updated_at) FROM stdin;
\.


--
-- Name: appointments appointments_appointmentNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_appointmentNumber_key" UNIQUE ("appointmentNumber");


--
-- Name: appointments appointments_appointmentNumber_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_appointmentNumber_key1" UNIQUE ("appointmentNumber");


--
-- Name: appointments appointments_appointmentNumber_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_appointmentNumber_key2" UNIQUE ("appointmentNumber");


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: business_clients business_clients_businessId_clientId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_clients
    ADD CONSTRAINT "business_clients_businessId_clientId_key" UNIQUE ("businessId", "clientId");


--
-- Name: business_clients business_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_clients
    ADD CONSTRAINT business_clients_pkey PRIMARY KEY (id);


--
-- Name: business_commission_configs business_commission_configs_businessId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_commission_configs
    ADD CONSTRAINT "business_commission_configs_businessId_key" UNIQUE ("businessId");


--
-- Name: business_commission_configs business_commission_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_commission_configs
    ADD CONSTRAINT business_commission_configs_pkey PRIMARY KEY (id);


--
-- Name: business_expense_categories business_expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_expense_categories
    ADD CONSTRAINT business_expense_categories_pkey PRIMARY KEY (id);


--
-- Name: business_expenses business_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_expenses
    ADD CONSTRAINT business_expenses_pkey PRIMARY KEY (id);


--
-- Name: business_rules business_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_rules
    ADD CONSTRAINT business_rules_pkey PRIMARY KEY (id);


--
-- Name: business_subscriptions business_subscriptions_businessId_subscriptionPlanId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_subscriptions
    ADD CONSTRAINT "business_subscriptions_businessId_subscriptionPlanId_key" UNIQUE ("businessId", "subscriptionPlanId");


--
-- Name: business_subscriptions business_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_subscriptions
    ADD CONSTRAINT business_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_subdomain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_subdomain_key UNIQUE (subdomain);


--
-- Name: businesses businesses_subdomain_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_subdomain_key1 UNIQUE (subdomain);


--
-- Name: businesses businesses_subdomain_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_subdomain_key2 UNIQUE (subdomain);


--
-- Name: cash_register_shifts cash_register_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_register_shifts
    ADD CONSTRAINT cash_register_shifts_pkey PRIMARY KEY (id);


--
-- Name: clients clients_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key UNIQUE (email);


--
-- Name: clients clients_email_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key1 UNIQUE (email);


--
-- Name: clients clients_email_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key2 UNIQUE (email);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: commission_details commission_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_details
    ADD CONSTRAINT commission_details_pkey PRIMARY KEY (id);


--
-- Name: commission_payment_requests commission_payment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_payment_requests
    ADD CONSTRAINT commission_payment_requests_pkey PRIMARY KEY (id);


--
-- Name: commission_payment_requests commission_payment_requests_requestNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_payment_requests
    ADD CONSTRAINT "commission_payment_requests_requestNumber_key" UNIQUE ("requestNumber");


--
-- Name: commission_payment_requests commission_payment_requests_requestNumber_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_payment_requests
    ADD CONSTRAINT "commission_payment_requests_requestNumber_key1" UNIQUE ("requestNumber");


--
-- Name: consent_signatures consent_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_signatures
    ADD CONSTRAINT consent_signatures_pkey PRIMARY KEY (id);


--
-- Name: consent_templates consent_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_templates
    ADD CONSTRAINT consent_templates_pkey PRIMARY KEY (id);


--
-- Name: financial_movements financial_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_movements
    ADD CONSTRAINT financial_movements_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: modules modules_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_name_key UNIQUE (name);


--
-- Name: modules modules_name_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_name_key1 UNIQUE (name);


--
-- Name: modules modules_name_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_name_key2 UNIQUE (name);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: owner_expenses owner_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_expenses
    ADD CONSTRAINT owner_expenses_pkey PRIMARY KEY (id);


--
-- Name: owner_financial_reports owner_financial_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_financial_reports
    ADD CONSTRAINT owner_financial_reports_pkey PRIMARY KEY (id);


--
-- Name: owner_payment_configurations owner_payment_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_payment_configurations
    ADD CONSTRAINT owner_payment_configurations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: password_reset_tokens password_reset_tokens_token_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key1 UNIQUE (token);


--
-- Name: payment_integrations payment_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_integrations
    ADD CONSTRAINT payment_integrations_pkey PRIMARY KEY (id);


--
-- Name: plan_modules plan_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_modules
    ADD CONSTRAINT plan_modules_pkey PRIMARY KEY (id);


--
-- Name: plan_modules plan_modules_subscriptionPlanId_moduleId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_modules
    ADD CONSTRAINT "plan_modules_subscriptionPlanId_moduleId_key" UNIQUE ("subscriptionPlanId", "moduleId");


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: rule_templates rule_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rule_templates
    ADD CONSTRAINT rule_templates_pkey PRIMARY KEY (id);


--
-- Name: service_commissions service_commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_commissions
    ADD CONSTRAINT service_commissions_pkey PRIMARY KEY (id);


--
-- Name: service_commissions service_commissions_serviceId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_commissions
    ADD CONSTRAINT "service_commissions_serviceId_key" UNIQUE ("serviceId");


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: specialist_branch_schedules specialist_branch_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_branch_schedules
    ADD CONSTRAINT specialist_branch_schedules_pkey PRIMARY KEY (id);


--
-- Name: specialist_branch_schedules specialist_branch_schedules_specialistId_branchId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_branch_schedules
    ADD CONSTRAINT "specialist_branch_schedules_specialistId_branchId_key" UNIQUE ("specialistId", "branchId");


--
-- Name: specialist_commissions specialist_commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_commissions
    ADD CONSTRAINT specialist_commissions_pkey PRIMARY KEY (id);


--
-- Name: specialist_documents specialist_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_documents
    ADD CONSTRAINT specialist_documents_pkey PRIMARY KEY (id);


--
-- Name: specialist_profiles specialist_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_profiles
    ADD CONSTRAINT specialist_profiles_pkey PRIMARY KEY (id);


--
-- Name: specialist_profiles specialist_profiles_userId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_profiles
    ADD CONSTRAINT "specialist_profiles_userId_key" UNIQUE ("userId");


--
-- Name: specialist_services specialist_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_services
    ADD CONSTRAINT specialist_services_pkey PRIMARY KEY (id);


--
-- Name: specialist_services specialist_services_specialistId_serviceId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_services
    ADD CONSTRAINT "specialist_services_specialistId_serviceId_key" UNIQUE ("specialistId", "serviceId");


--
-- Name: subscription_payments subscription_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_payments
    ADD CONSTRAINT subscription_payments_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: user_branches user_branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_branches
    ADD CONSTRAINT user_branches_pkey PRIMARY KEY (id);


--
-- Name: user_branches user_branches_userId_branchId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_branches
    ADD CONSTRAINT "user_branches_userId_branchId_key" UNIQUE ("userId", "branchId");


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_message_templates whatsapp_message_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_message_templates
    ADD CONSTRAINT whatsapp_message_templates_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_messages whatsapp_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_tokens whatsapp_tokens_business_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_tokens
    ADD CONSTRAINT whatsapp_tokens_business_id_key UNIQUE (business_id);


--
-- Name: whatsapp_tokens whatsapp_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_tokens
    ADD CONSTRAINT whatsapp_tokens_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_webhook_events whatsapp_webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_webhook_events
    ADD CONSTRAINT whatsapp_webhook_events_pkey PRIMARY KEY (id);


--
-- Name: appointments_appointment_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_appointment_number ON public.appointments USING btree ("appointmentNumber");


--
-- Name: appointments_business_id_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_business_id_start_time ON public.appointments USING btree ("businessId", "startTime");


--
-- Name: appointments_client_id_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_client_id_business_id ON public.appointments USING btree ("clientId", "businessId");


--
-- Name: appointments_specialist_id_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_specialist_id_start_time ON public.appointments USING btree ("specialistId", "startTime");


--
-- Name: appointments_status_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_status_business_id ON public.appointments USING btree (status, "businessId");


--
-- Name: branch_day_schedule; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX branch_day_schedule ON public.specialist_branch_schedules USING btree ("branchId", "dayOfWeek");


--
-- Name: business_clients_business_id_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX business_clients_business_id_client_id ON public.business_clients USING btree ("businessId", "clientId");


--
-- Name: business_clients_business_id_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_clients_business_id_status ON public.business_clients USING btree ("businessId", status);


--
-- Name: business_clients_client_number_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_clients_client_number_business_id ON public.business_clients USING btree ("clientNumber", "businessId");


--
-- Name: business_commission_configs_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX business_commission_configs_business_id ON public.business_commission_configs USING btree ("businessId");


--
-- Name: business_expense_categories_business_id_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_expense_categories_business_id_is_active ON public.business_expense_categories USING btree ("businessId", "isActive");


--
-- Name: business_expense_categories_business_id_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX business_expense_categories_business_id_name ON public.business_expense_categories USING btree ("businessId", name);


--
-- Name: business_expenses_business_id_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_expenses_business_id_category_id ON public.business_expenses USING btree ("businessId", "categoryId");


--
-- Name: business_expenses_business_id_expense_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_expenses_business_id_expense_date ON public.business_expenses USING btree ("businessId", "expenseDate");


--
-- Name: business_expenses_business_id_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_expenses_business_id_is_active ON public.business_expenses USING btree ("businessId", "isActive");


--
-- Name: business_expenses_business_id_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_expenses_business_id_status ON public.business_expenses USING btree ("businessId", status);


--
-- Name: business_expenses_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_expenses_created_by ON public.business_expenses USING btree ("createdBy");


--
-- Name: business_expenses_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_expenses_vendor ON public.business_expenses USING btree (vendor);


--
-- Name: business_rules_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_rules_business_id ON public.business_rules USING btree ("businessId");


--
-- Name: business_rules_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_rules_is_active ON public.business_rules USING btree ("isActive");


--
-- Name: business_rules_rule_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_rules_rule_template_id ON public.business_rules USING btree ("ruleTemplateId");


--
-- Name: cash_register_shifts_branch_id_opened_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cash_register_shifts_branch_id_opened_at ON public.cash_register_shifts USING btree (branch_id, opened_at);


--
-- Name: cash_register_shifts_business_id_opened_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cash_register_shifts_business_id_opened_at ON public.cash_register_shifts USING btree (business_id, opened_at);


--
-- Name: cash_register_shifts_status_opened_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cash_register_shifts_status_opened_at ON public.cash_register_shifts USING btree (status, opened_at);


--
-- Name: cash_register_shifts_user_id_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cash_register_shifts_user_id_status ON public.cash_register_shifts USING btree (user_id, status);


--
-- Name: commission_details_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_details_appointment_id ON public.commission_details USING btree ("appointmentId");


--
-- Name: commission_details_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_details_client_id ON public.commission_details USING btree ("clientId");


--
-- Name: commission_details_payment_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_details_payment_request_id ON public.commission_details USING btree ("paymentRequestId");


--
-- Name: commission_details_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_details_payment_status ON public.commission_details USING btree ("paymentStatus");


--
-- Name: commission_details_service_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_details_service_date ON public.commission_details USING btree ("serviceDate");


--
-- Name: commission_details_service_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_details_service_id ON public.commission_details USING btree ("serviceId");


--
-- Name: commission_payment_requests_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_payment_requests_business_id ON public.commission_payment_requests USING btree ("businessId");


--
-- Name: commission_payment_requests_period_from_period_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_payment_requests_period_from_period_to ON public.commission_payment_requests USING btree ("periodFrom", "periodTo");


--
-- Name: commission_payment_requests_request_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_payment_requests_request_number ON public.commission_payment_requests USING btree ("requestNumber");


--
-- Name: commission_payment_requests_specialist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_payment_requests_specialist_id ON public.commission_payment_requests USING btree ("specialistId");


--
-- Name: commission_payment_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_payment_requests_status ON public.commission_payment_requests USING btree (status);


--
-- Name: consent_signatures_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consent_signatures_appointment_id ON public.consent_signatures USING btree ("appointmentId");


--
-- Name: consent_signatures_business_id_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consent_signatures_business_id_customer_id ON public.consent_signatures USING btree ("businessId", "customerId");


--
-- Name: consent_signatures_consent_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consent_signatures_consent_template_id ON public.consent_signatures USING btree ("consentTemplateId");


--
-- Name: consent_signatures_customer_id_consent_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consent_signatures_customer_id_consent_template_id ON public.consent_signatures USING btree ("customerId", "consentTemplateId");


--
-- Name: consent_signatures_service_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consent_signatures_service_id ON public.consent_signatures USING btree ("serviceId");


--
-- Name: consent_signatures_signed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consent_signatures_signed_at ON public.consent_signatures USING btree ("signedAt");


--
-- Name: consent_signatures_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consent_signatures_status ON public.consent_signatures USING btree (status);


--
-- Name: consent_templates_business_id_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consent_templates_business_id_category ON public.consent_templates USING btree ("businessId", category);


--
-- Name: consent_templates_business_id_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consent_templates_business_id_is_active ON public.consent_templates USING btree ("businessId", "isActive");


--
-- Name: consent_templates_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consent_templates_code ON public.consent_templates USING btree (code);


--
-- Name: financial_movements_business_id_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX financial_movements_business_id_category ON public.financial_movements USING btree ("businessId", category);


--
-- Name: financial_movements_business_id_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX financial_movements_business_id_status ON public.financial_movements USING btree ("businessId", status);


--
-- Name: financial_movements_business_id_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX financial_movements_business_id_type ON public.financial_movements USING btree ("businessId", type);


--
-- Name: financial_movements_client_id_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX financial_movements_client_id_business_id ON public.financial_movements USING btree ("clientId", "businessId");


--
-- Name: financial_movements_reference_id_reference_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX financial_movements_reference_id_reference_type ON public.financial_movements USING btree ("referenceId", "referenceType");


--
-- Name: financial_movements_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX financial_movements_transaction_id ON public.financial_movements USING btree ("transactionId");


--
-- Name: financial_movements_user_id_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX financial_movements_user_id_business_id ON public.financial_movements USING btree ("userId", "businessId");


--
-- Name: idx_specialist_service_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_specialist_service_active ON public.specialist_services USING btree ("isActive");


--
-- Name: idx_specialist_service_bookable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_specialist_service_bookable ON public.specialist_services USING btree ("canBeBooked");


--
-- Name: idx_specialist_service_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_specialist_service_service ON public.specialist_services USING btree ("serviceId");


--
-- Name: idx_specialist_service_specialist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_specialist_service_specialist ON public.specialist_services USING btree ("specialistId");


--
-- Name: idx_user_branch_branch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_branch_branch ON public.user_branches USING btree ("branchId");


--
-- Name: idx_user_branch_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_branch_default ON public.user_branches USING btree ("isDefault");


--
-- Name: idx_user_branch_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_branch_user ON public.user_branches USING btree ("userId");


--
-- Name: inventory_movements_business_id_movement_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_movements_business_id_movement_type ON public.inventory_movements USING btree ("businessId", "movementType");


--
-- Name: inventory_movements_business_id_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_movements_business_id_product_id ON public.inventory_movements USING btree ("businessId", "productId");


--
-- Name: inventory_movements_reference_id_reference_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_movements_reference_id_reference_type ON public.inventory_movements USING btree ("referenceId", "referenceType");


--
-- Name: inventory_movements_user_id_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_movements_user_id_business_id ON public.inventory_movements USING btree ("userId", "businessId");


--
-- Name: owner_expenses_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_expenses_category ON public.owner_expenses USING btree (category);


--
-- Name: owner_expenses_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_expenses_created_by ON public.owner_expenses USING btree ("createdBy");


--
-- Name: owner_expenses_expense_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_expenses_expense_date ON public.owner_expenses USING btree ("expenseDate");


--
-- Name: owner_expenses_expense_date_category_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_expenses_expense_date_category_status ON public.owner_expenses USING btree ("expenseDate", category, status);


--
-- Name: owner_expenses_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_expenses_is_active ON public.owner_expenses USING btree ("isActive");


--
-- Name: owner_expenses_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_expenses_status ON public.owner_expenses USING btree (status);


--
-- Name: owner_expenses_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_expenses_vendor ON public.owner_expenses USING btree (vendor);


--
-- Name: owner_financial_reports_generated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_financial_reports_generated_at ON public.owner_financial_reports USING btree ("generatedAt");


--
-- Name: owner_financial_reports_report_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_financial_reports_report_period ON public.owner_financial_reports USING btree ("reportPeriod");


--
-- Name: owner_financial_reports_report_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_financial_reports_report_type ON public.owner_financial_reports USING btree ("reportType");


--
-- Name: owner_financial_reports_start_date_end_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_financial_reports_start_date_end_date ON public.owner_financial_reports USING btree ("startDate", "endDate");


--
-- Name: owner_financial_reports_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_financial_reports_status ON public.owner_financial_reports USING btree (status);


--
-- Name: owner_payment_configurations_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_payment_configurations_is_active ON public.owner_payment_configurations USING btree ("isActive");


--
-- Name: owner_payment_configurations_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_payment_configurations_is_default ON public.owner_payment_configurations USING btree ("isDefault");


--
-- Name: owner_payment_configurations_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX owner_payment_configurations_provider ON public.owner_payment_configurations USING btree (provider);


--
-- Name: password_reset_tokens_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX password_reset_tokens_expires_at ON public.password_reset_tokens USING btree ("expiresAt");


--
-- Name: password_reset_tokens_is_used; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX password_reset_tokens_is_used ON public.password_reset_tokens USING btree ("isUsed");


--
-- Name: password_reset_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX password_reset_tokens_token ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_token_is_used_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX password_reset_tokens_token_is_used_expires_at ON public.password_reset_tokens USING btree (token, "isUsed", "expiresAt");


--
-- Name: password_reset_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX password_reset_tokens_user_id ON public.password_reset_tokens USING btree ("userId");


--
-- Name: payment_integrations_business_id_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_integrations_business_id_is_active ON public.payment_integrations USING btree ("businessId", "isActive");


--
-- Name: payment_integrations_business_id_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_integrations_business_id_provider ON public.payment_integrations USING btree ("businessId", provider);


--
-- Name: payment_integrations_business_id_provider_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX payment_integrations_business_id_provider_name ON public.payment_integrations USING btree ("businessId", provider, name);


--
-- Name: plan_modules_subscription_plan_id_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX plan_modules_subscription_plan_id_module_id ON public.plan_modules USING btree ("subscriptionPlanId", "moduleId");


--
-- Name: products_barcode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_barcode ON public.products USING btree (barcode);


--
-- Name: products_business_id_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_business_id_category ON public.products USING btree ("businessId", category);


--
-- Name: products_business_id_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_business_id_is_active ON public.products USING btree ("businessId", "isActive");


--
-- Name: products_sku_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_sku_business_id ON public.products USING btree (sku, "businessId");


--
-- Name: rule_templates_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rule_templates_category ON public.rule_templates USING btree (category);


--
-- Name: rule_templates_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rule_templates_is_active ON public.rule_templates USING btree ("isActive");


--
-- Name: rule_templates_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX rule_templates_key ON public.rule_templates USING btree (key);


--
-- Name: rule_templates_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rule_templates_type ON public.rule_templates USING btree (type);


--
-- Name: service_commissions_service_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX service_commissions_service_id ON public.service_commissions USING btree ("serviceId");


--
-- Name: services_business_id_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX services_business_id_category ON public.services USING btree ("businessId", category);


--
-- Name: services_business_id_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX services_business_id_is_active ON public.services USING btree ("businessId", "isActive");


--
-- Name: services_is_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX services_is_package ON public.services USING btree ("isPackage");


--
-- Name: specialist_commissions_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_commissions_business_id ON public.specialist_commissions USING btree ("businessId");


--
-- Name: specialist_commissions_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_commissions_is_active ON public.specialist_commissions USING btree ("isActive");


--
-- Name: specialist_commissions_service_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_commissions_service_id ON public.specialist_commissions USING btree ("serviceId");


--
-- Name: specialist_commissions_specialist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_commissions_specialist_id ON public.specialist_commissions USING btree ("specialistId");


--
-- Name: specialist_day_schedule; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_day_schedule ON public.specialist_branch_schedules USING btree ("specialistId", "dayOfWeek");


--
-- Name: specialist_documents_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_documents_business_id ON public.specialist_documents USING btree ("businessId");


--
-- Name: specialist_documents_document_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_documents_document_type ON public.specialist_documents USING btree ("documentType");


--
-- Name: specialist_documents_specialist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_documents_specialist_id ON public.specialist_documents USING btree ("specialistId");


--
-- Name: specialist_documents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_documents_status ON public.specialist_documents USING btree (status);


--
-- Name: specialist_profiles_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_profiles_business_id ON public.specialist_profiles USING btree ("businessId");


--
-- Name: specialist_profiles_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_profiles_is_active ON public.specialist_profiles USING btree ("isActive");


--
-- Name: specialist_profiles_specialization; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_profiles_specialization ON public.specialist_profiles USING btree (specialization);


--
-- Name: specialist_profiles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX specialist_profiles_status ON public.specialist_profiles USING btree (status);


--
-- Name: specialist_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX specialist_profiles_user_id ON public.specialist_profiles USING btree ("userId");


--
-- Name: subscription_payments_business_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscription_payments_business_subscription_id ON public.subscription_payments USING btree ("businessSubscriptionId");


--
-- Name: subscription_payments_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscription_payments_due_date ON public.subscription_payments USING btree ("dueDate");


--
-- Name: subscription_payments_paid_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscription_payments_paid_at ON public.subscription_payments USING btree ("paidAt");


--
-- Name: subscription_payments_payment_method; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscription_payments_payment_method ON public.subscription_payments USING btree ("paymentMethod");


--
-- Name: subscription_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscription_payments_status ON public.subscription_payments USING btree (status);


--
-- Name: subscription_payments_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscription_payments_transaction_id ON public.subscription_payments USING btree ("transactionId");


--
-- Name: unique_branch_code_per_business; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_branch_code_per_business ON public.branches USING btree ("businessId", code);


--
-- Name: unique_business_consent_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_business_consent_code ON public.consent_templates USING btree ("businessId", code);


--
-- Name: unique_business_rule_template; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_business_rule_template ON public.business_rules USING btree ("businessId", "ruleTemplateId");


--
-- Name: unique_main_branch_per_business; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unique_main_branch_per_business ON public.branches USING btree ("businessId", "isMain") WHERE ("isMain" = true);


--
-- Name: unique_report_period; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_report_period ON public.owner_financial_reports USING btree ("reportType", "reportPeriod");


--
-- Name: unique_specialist_branch_day; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_specialist_branch_day ON public.specialist_branch_schedules USING btree ("specialistId", "branchId", "dayOfWeek");


--
-- Name: unique_specialist_service; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_specialist_service ON public.specialist_services USING btree ("specialistId", "serviceId");


--
-- Name: unique_specialist_service_commission; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_specialist_service_commission ON public.specialist_commissions USING btree ("specialistId", "serviceId", "effectiveFrom");


--
-- Name: unique_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_transaction_id ON public.subscription_payments USING btree ("transactionId") WHERE ("transactionId" IS NOT NULL);


--
-- Name: unique_user_branch; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_user_branch ON public.user_branches USING btree ("userId", "branchId");


--
-- Name: whatsapp_message_templates_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_message_templates_business_id ON public.whatsapp_message_templates USING btree (business_id);


--
-- Name: whatsapp_message_templates_business_id_template_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX whatsapp_message_templates_business_id_template_name ON public.whatsapp_message_templates USING btree (business_id, template_name);


--
-- Name: whatsapp_message_templates_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_message_templates_status ON public.whatsapp_message_templates USING btree (status);


--
-- Name: whatsapp_messages_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_messages_appointment_id ON public.whatsapp_messages USING btree (appointment_id);


--
-- Name: whatsapp_messages_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_messages_business_id ON public.whatsapp_messages USING btree (business_id);


--
-- Name: whatsapp_messages_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_messages_client_id ON public.whatsapp_messages USING btree (client_id);


--
-- Name: whatsapp_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_messages_created_at ON public.whatsapp_messages USING btree (created_at);


--
-- Name: whatsapp_messages_provider_message_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_messages_provider_message_id ON public.whatsapp_messages USING btree (provider_message_id);


--
-- Name: whatsapp_messages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_messages_status ON public.whatsapp_messages USING btree (status);


--
-- Name: whatsapp_tokens_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX whatsapp_tokens_business_id ON public.whatsapp_tokens USING btree (business_id);


--
-- Name: whatsapp_tokens_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_tokens_expires_at ON public.whatsapp_tokens USING btree (expires_at);


--
-- Name: whatsapp_tokens_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_tokens_is_active ON public.whatsapp_tokens USING btree (is_active);


--
-- Name: whatsapp_webhook_events_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_webhook_events_business_id ON public.whatsapp_webhook_events USING btree (business_id);


--
-- Name: whatsapp_webhook_events_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_webhook_events_event_type ON public.whatsapp_webhook_events USING btree (event_type);


--
-- Name: whatsapp_webhook_events_message_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_webhook_events_message_id ON public.whatsapp_webhook_events USING btree (message_id);


--
-- Name: whatsapp_webhook_events_processed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_webhook_events_processed ON public.whatsapp_webhook_events USING btree (processed);


--
-- Name: whatsapp_webhook_events_received_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_webhook_events_received_at ON public.whatsapp_webhook_events USING btree (received_at);


--
-- Name: appointments appointments_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appointments appointments_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE;


--
-- Name: appointments appointments_canceledBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_canceledBy_fkey" FOREIGN KEY ("canceledBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appointments appointments_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.clients(id) ON UPDATE CASCADE;


--
-- Name: appointments appointments_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.services(id) ON UPDATE CASCADE;


--
-- Name: appointments appointments_specialistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: branches branches_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "branches_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_clients business_clients_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_clients
    ADD CONSTRAINT "business_clients_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_clients business_clients_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_clients
    ADD CONSTRAINT "business_clients_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.clients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_clients business_clients_preferredSpecialistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_clients
    ADD CONSTRAINT "business_clients_preferredSpecialistId_fkey" FOREIGN KEY ("preferredSpecialistId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: business_commission_configs business_commission_configs_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_commission_configs
    ADD CONSTRAINT "business_commission_configs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_expense_categories business_expense_categories_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_expense_categories
    ADD CONSTRAINT "business_expense_categories_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_expense_categories business_expense_categories_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_expense_categories
    ADD CONSTRAINT "business_expense_categories_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: business_expense_categories business_expense_categories_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_expense_categories
    ADD CONSTRAINT "business_expense_categories_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id);


--
-- Name: business_expenses business_expenses_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_expenses
    ADD CONSTRAINT "business_expenses_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: business_expenses business_expenses_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_expenses
    ADD CONSTRAINT "business_expenses_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_expenses business_expenses_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_expenses
    ADD CONSTRAINT "business_expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.business_expense_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_expenses business_expenses_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_expenses
    ADD CONSTRAINT "business_expenses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: business_expenses business_expenses_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_expenses
    ADD CONSTRAINT "business_expenses_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id);


--
-- Name: business_rules business_rules_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_rules
    ADD CONSTRAINT "business_rules_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_rules business_rules_ruleTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_rules
    ADD CONSTRAINT "business_rules_ruleTemplateId_fkey" FOREIGN KEY ("ruleTemplateId") REFERENCES public.rule_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_rules business_rules_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_rules
    ADD CONSTRAINT "business_rules_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: business_subscriptions business_subscriptions_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_subscriptions
    ADD CONSTRAINT "business_subscriptions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_subscriptions business_subscriptions_subscriptionPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_subscriptions
    ADD CONSTRAINT "business_subscriptions_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES public.subscription_plans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: businesses businesses_currentPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "businesses_currentPlanId_fkey" FOREIGN KEY ("currentPlanId") REFERENCES public.subscription_plans(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cash_register_shifts cash_register_shifts_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_register_shifts
    ADD CONSTRAINT cash_register_shifts_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cash_register_shifts cash_register_shifts_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_register_shifts
    ADD CONSTRAINT cash_register_shifts_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE;


--
-- Name: cash_register_shifts cash_register_shifts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_register_shifts
    ADD CONSTRAINT cash_register_shifts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: clients clients_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: commission_details commission_details_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_details
    ADD CONSTRAINT "commission_details_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: commission_details commission_details_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_details
    ADD CONSTRAINT "commission_details_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.clients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: commission_details commission_details_paymentRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_details
    ADD CONSTRAINT "commission_details_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES public.commission_payment_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: commission_details commission_details_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_details
    ADD CONSTRAINT "commission_details_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: commission_payment_requests commission_payment_requests_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_payment_requests
    ADD CONSTRAINT "commission_payment_requests_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: commission_payment_requests commission_payment_requests_paidBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_payment_requests
    ADD CONSTRAINT "commission_payment_requests_paidBy_fkey" FOREIGN KEY ("paidBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: commission_payment_requests commission_payment_requests_reviewedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_payment_requests
    ADD CONSTRAINT "commission_payment_requests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: commission_payment_requests commission_payment_requests_specialistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_payment_requests
    ADD CONSTRAINT "commission_payment_requests_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: consent_signatures consent_signatures_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_signatures
    ADD CONSTRAINT "consent_signatures_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: consent_signatures consent_signatures_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_signatures
    ADD CONSTRAINT "consent_signatures_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: consent_signatures consent_signatures_consentTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_signatures
    ADD CONSTRAINT "consent_signatures_consentTemplateId_fkey" FOREIGN KEY ("consentTemplateId") REFERENCES public.consent_templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: consent_signatures consent_signatures_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_signatures
    ADD CONSTRAINT "consent_signatures_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.clients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: consent_signatures consent_signatures_revokedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_signatures
    ADD CONSTRAINT "consent_signatures_revokedBy_fkey" FOREIGN KEY ("revokedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: consent_signatures consent_signatures_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_signatures
    ADD CONSTRAINT "consent_signatures_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: consent_templates consent_templates_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_templates
    ADD CONSTRAINT "consent_templates_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: financial_movements financial_movements_businessExpenseCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_movements
    ADD CONSTRAINT "financial_movements_businessExpenseCategoryId_fkey" FOREIGN KEY ("businessExpenseCategoryId") REFERENCES public.business_expense_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_movements financial_movements_businessExpenseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_movements
    ADD CONSTRAINT "financial_movements_businessExpenseId_fkey" FOREIGN KEY ("businessExpenseId") REFERENCES public.business_expenses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_movements financial_movements_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_movements
    ADD CONSTRAINT "financial_movements_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE;


--
-- Name: financial_movements financial_movements_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_movements
    ADD CONSTRAINT "financial_movements_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.clients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_movements financial_movements_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_movements
    ADD CONSTRAINT "financial_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: inventory_movements inventory_movements_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inventory_movements inventory_movements_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inventory_movements inventory_movements_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT "inventory_movements_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE;


--
-- Name: inventory_movements inventory_movements_from_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_from_branch_id_fkey FOREIGN KEY (from_branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inventory_movements inventory_movements_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE;


--
-- Name: inventory_movements inventory_movements_specialist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_specialist_id_fkey FOREIGN KEY (specialist_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inventory_movements inventory_movements_to_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_to_branch_id_fkey FOREIGN KEY (to_branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inventory_movements inventory_movements_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT "inventory_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: owner_expenses owner_expenses_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_expenses
    ADD CONSTRAINT "owner_expenses_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: owner_expenses owner_expenses_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_expenses
    ADD CONSTRAINT "owner_expenses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_integrations payment_integrations_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_integrations
    ADD CONSTRAINT "payment_integrations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: plan_modules plan_modules_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_modules
    ADD CONSTRAINT "plan_modules_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: plan_modules plan_modules_subscriptionPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_modules
    ADD CONSTRAINT "plan_modules_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES public.subscription_plans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_commissions service_commissions_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_commissions
    ADD CONSTRAINT "service_commissions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: services services_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT "services_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: services services_consentTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT "services_consentTemplateId_fkey" FOREIGN KEY ("consentTemplateId") REFERENCES public.consent_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: specialist_branch_schedules specialist_branch_schedules_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_branch_schedules
    ADD CONSTRAINT "specialist_branch_schedules_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specialist_branch_schedules specialist_branch_schedules_specialistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_branch_schedules
    ADD CONSTRAINT "specialist_branch_schedules_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES public.specialist_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specialist_commissions specialist_commissions_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_commissions
    ADD CONSTRAINT "specialist_commissions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specialist_commissions specialist_commissions_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_commissions
    ADD CONSTRAINT "specialist_commissions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specialist_commissions specialist_commissions_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_commissions
    ADD CONSTRAINT "specialist_commissions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: specialist_commissions specialist_commissions_specialistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_commissions
    ADD CONSTRAINT "specialist_commissions_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specialist_documents specialist_documents_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_documents
    ADD CONSTRAINT "specialist_documents_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: specialist_documents specialist_documents_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_documents
    ADD CONSTRAINT "specialist_documents_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specialist_documents specialist_documents_specialistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_documents
    ADD CONSTRAINT "specialist_documents_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specialist_documents specialist_documents_uploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_documents
    ADD CONSTRAINT "specialist_documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specialist_profiles specialist_profiles_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_profiles
    ADD CONSTRAINT "specialist_profiles_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specialist_profiles specialist_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_profiles
    ADD CONSTRAINT "specialist_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specialist_services specialist_services_assignedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_services
    ADD CONSTRAINT "specialist_services_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: specialist_services specialist_services_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_services
    ADD CONSTRAINT "specialist_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specialist_services specialist_services_specialistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_services
    ADD CONSTRAINT "specialist_services_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscription_payments subscription_payments_businessSubscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_payments
    ADD CONSTRAINT "subscription_payments_businessSubscriptionId_fkey" FOREIGN KEY ("businessSubscriptionId") REFERENCES public.business_subscriptions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: subscription_payments subscription_payments_originalPaymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_payments
    ADD CONSTRAINT "subscription_payments_originalPaymentId_fkey" FOREIGN KEY ("originalPaymentId") REFERENCES public.subscription_payments(id);


--
-- Name: subscription_payments subscription_payments_paymentConfigurationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_payments
    ADD CONSTRAINT "subscription_payments_paymentConfigurationId_fkey" FOREIGN KEY ("paymentConfigurationId") REFERENCES public.owner_payment_configurations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: subscription_payments subscription_payments_receiptUploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_payments
    ADD CONSTRAINT "subscription_payments_receiptUploadedBy_fkey" FOREIGN KEY ("receiptUploadedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_branches user_branches_assignedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_branches
    ADD CONSTRAINT "user_branches_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_branches user_branches_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_branches
    ADD CONSTRAINT "user_branches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_branches user_branches_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_branches
    ADD CONSTRAINT "user_branches_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: whatsapp_message_templates whatsapp_message_templates_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_message_templates
    ADD CONSTRAINT whatsapp_message_templates_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- Name: whatsapp_messages whatsapp_messages_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: whatsapp_messages whatsapp_messages_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- Name: whatsapp_messages whatsapp_messages_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: whatsapp_tokens whatsapp_tokens_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_tokens
    ADD CONSTRAINT whatsapp_tokens_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: whatsapp_webhook_events whatsapp_webhook_events_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_webhook_events
    ADD CONSTRAINT whatsapp_webhook_events_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- PostgreSQL database dump complete
--

