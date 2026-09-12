CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text,
	"role" text DEFAULT 'ik_admin' NOT NULL,
	"department_id" integer,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"date" text NOT NULL,
	"type" text NOT NULL,
	"day_count" double precision DEFAULT 1 NOT NULL,
	"note" text,
	"created_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" integer,
	"action" text NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"record_type" text NOT NULL,
	"title" text,
	"effective_date" text,
	"target_title" text,
	"target_date" text,
	"development_note" text,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collective_agreements" (
	"id" serial PRIMARY KEY NOT NULL,
	"union_name" text NOT NULL,
	"agreement_start_date" text NOT NULL,
	"agreement_end_date" text NOT NULL,
	"covered_employee_count" integer NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competency_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "critical_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_name" text NOT NULL,
	"current_employee_id" integer,
	"backup_count" integer DEFAULT 0 NOT NULL,
	"backup_status" text,
	"risk_level" text DEFAULT 'orta' NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"audit_date" text NOT NULL,
	"score" double precision NOT NULL,
	"description" text,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disability_quota" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_headcount" integer NOT NULL,
	"current_disabled_employee_count" integer DEFAULT 0 NOT NULL,
	"monthly_penalty_risk_estimate" double precision,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disciplinary_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"record_date" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"created_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_competencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"competency_field_id" integer NOT NULL,
	"is_competent" boolean DEFAULT false NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"department_id" integer NOT NULL,
	"branch_id" integer NOT NULL,
	"collar_type" text NOT NULL,
	"hire_date" text NOT NULL,
	"termination_date" text,
	"monthly_salary" double precision,
	"status" text DEFAULT 'aktif' NOT NULL,
	"birth_date" text,
	"gender" text,
	"is_retired" boolean DEFAULT false NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"review_type" text DEFAULT 'ise_giris' NOT NULL,
	"stage" text NOT NULL,
	"due_date" text NOT NULL,
	"status" text DEFAULT 'bekliyor' NOT NULL,
	"competency_score" integer,
	"adaptation_score" integer,
	"performance_score" integer,
	"evaluated_at" text,
	"evaluated_by" integer,
	"notes" text,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exit_interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"exit_date" text NOT NULL,
	"reason_category" text NOT NULL,
	"notes" text,
	"created_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "garnishments" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"enforcement_office" text NOT NULL,
	"case_number" text NOT NULL,
	"total_debt" double precision NOT NULL,
	"monthly_deduction_amount" double precision NOT NULL,
	"deducted_amount" double precision DEFAULT 0 NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_screenings" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"screening_type" text NOT NULL,
	"last_screening_date" text,
	"due_date" text NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kvkk_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"data_category" text NOT NULL,
	"processing_purpose" text NOT NULL,
	"legal_basis" text NOT NULL,
	"retention_period" text NOT NULL,
	"transferred_party" text,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"as_of_year" integer NOT NULL,
	"earned_days" double precision DEFAULT 0 NOT NULL,
	"used_days" double precision DEFAULT 0 NOT NULL,
	"remaining_days_total" double precision DEFAULT 0 NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license" (
	"id" serial PRIMARY KEY NOT NULL,
	"license_key" text NOT NULL,
	"activated_at" text,
	"expires_at" text,
	"last_checked_at" text,
	"status" text DEFAULT 'aktif' NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manager_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"note_date" text NOT NULL,
	"note" text NOT NULL,
	"training_id" integer,
	"created_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mandatory_trainings" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"training_type" text NOT NULL,
	"last_completed_date" text,
	"due_date" text NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mediation_cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"case_date" text NOT NULL,
	"paid_amount" double precision NOT NULL,
	"estimated_lawsuit_cost" double precision NOT NULL,
	"notes" text,
	"created_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recognitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"award_name" text NOT NULL,
	"award_date" text NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_score_weights" (
	"id" serial PRIMARY KEY NOT NULL,
	"attendance_trend_weight" double precision DEFAULT 30 NOT NULL,
	"overtime_load_weight" double precision DEFAULT 20 NOT NULL,
	"disciplinary_count_weight" double precision DEFAULT 20 NOT NULL,
	"low_seniority_weight" double precision DEFAULT 15 NOT NULL,
	"accrued_leave_weight" double precision DEFAULT 15 NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text DEFAULT 'Sirketiniz' NOT NULL,
	"trial_period_months" integer DEFAULT 2 NOT NULL,
	"legal_overtime_limit_hours" integer DEFAULT 270 NOT NULL,
	"leave_critical_threshold_days" integer DEFAULT 30 NOT NULL,
	"leave_warning_threshold_days" integer DEFAULT 15 NOT NULL,
	"disability_quota_percentage" double precision DEFAULT 0.03 NOT NULL,
	"default_daily_wage_blue_collar" double precision,
	"default_daily_wage_white_collar" double precision,
	"default_hiring_cost_blue_collar" double precision,
	"default_hiring_cost_white_collar" double precision,
	"default_ppe_cost_blue_collar" double precision,
	"default_ppe_cost_white_collar" double precision,
	"avg_vacancy_days_blue_collar" integer,
	"avg_vacancy_days_white_collar" integer,
	"onboarding_productivity_loss_cost_blue_collar" double precision,
	"onboarding_productivity_loss_cost_white_collar" double precision,
	"monthly_workforce_cost" double precision,
	"monthly_revenue" double precision,
	"collective_agreement_warning_days" integer DEFAULT 90 NOT NULL,
	"panel_password_hash" text,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sgk_incentive_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"age_min" integer,
	"age_max" integer,
	"gender" text,
	"requires_disability" boolean DEFAULT false NOT NULL,
	"region" text,
	"estimated_amount" double precision,
	"estimated_rate_percent" double precision,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shifts_overtime" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"period" text NOT NULL,
	"overtime_hours" double precision DEFAULT 0 NOT NULL,
	"night_shift_count" integer DEFAULT 0 NOT NULL,
	"weekend_overtime_count" integer DEFAULT 0 NOT NULL,
	"created_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainings" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"training_name" text NOT NULL,
	"training_field" text NOT NULL,
	"status" text DEFAULT 'tamamlanmadi' NOT NULL,
	"completed_date" text,
	"created_at" text DEFAULT now()::text NOT NULL,
	"updated_at" text DEFAULT now()::text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_records" ADD CONSTRAINT "career_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "critical_roles" ADD CONSTRAINT "critical_roles_current_employee_id_employees_id_fk" FOREIGN KEY ("current_employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disciplinary_records" ADD CONSTRAINT "disciplinary_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_competencies" ADD CONSTRAINT "employee_competencies_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_competencies" ADD CONSTRAINT "employee_competencies_competency_field_id_competency_fields_id_fk" FOREIGN KEY ("competency_field_id") REFERENCES "public"."competency_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluated_by_admin_users_id_fk" FOREIGN KEY ("evaluated_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exit_interviews" ADD CONSTRAINT "exit_interviews_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garnishments" ADD CONSTRAINT "garnishments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_screenings" ADD CONSTRAINT "health_screenings_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_notes" ADD CONSTRAINT "manager_notes_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_notes" ADD CONSTRAINT "manager_notes_author_id_admin_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_notes" ADD CONSTRAINT "manager_notes_training_id_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."trainings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandatory_trainings" ADD CONSTRAINT "mandatory_trainings_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediation_cases" ADD CONSTRAINT "mediation_cases_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts_overtime" ADD CONSTRAINT "shifts_overtime_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "attendance_employee_date_idx" ON "attendance" USING btree ("employee_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_name_idx" ON "branches" USING btree ("name");--> statement-breakpoint
CREATE INDEX "career_records_employee_idx" ON "career_records" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "departments_name_idx" ON "departments" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "employee_competencies_employee_field_idx" ON "employee_competencies" USING btree ("employee_id","competency_field_id");--> statement-breakpoint
CREATE INDEX "employees_department_idx" ON "employees" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "employees_branch_idx" ON "employees" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "employees_status_idx" ON "employees" USING btree ("status");--> statement-breakpoint
CREATE INDEX "evaluations_employee_idx" ON "evaluations" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "evaluations_status_idx" ON "evaluations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "garnishments_employee_idx" ON "garnishments" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "health_screenings_due_date_idx" ON "health_screenings" USING btree ("due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "leave_balances_employee_year_idx" ON "leave_balances" USING btree ("employee_id","as_of_year");--> statement-breakpoint
CREATE INDEX "mandatory_trainings_due_date_idx" ON "mandatory_trainings" USING btree ("due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "shifts_overtime_employee_period_idx" ON "shifts_overtime" USING btree ("employee_id","period");--> statement-breakpoint
CREATE INDEX "trainings_employee_idx" ON "trainings" USING btree ("employee_id");