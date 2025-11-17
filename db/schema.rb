# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_01_23_165610) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "action_text_rich_texts", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.datetime "updated_at", null: false
    t.index ["record_type", "record_id", "name"], name: "index_action_text_rich_texts_uniqueness", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "answers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "question_id", null: false
    t.bigint "ticket_id", null: false
    t.datetime "updated_at", null: false
    t.string "value"
    t.index ["question_id"], name: "index_answers_on_question_id"
    t.index ["ticket_id", "question_id"], name: "index_answers_on_ticket_id_and_question_id", unique: true
    t.index ["ticket_id"], name: "index_answers_on_ticket_id"
  end

  create_table "events", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "group_id", null: false
    t.integer "happenings_count", default: 0, null: false
    t.boolean "pinned", default: false, null: false
    t.boolean "reserved", default: false, null: false
    t.boolean "single", default: false, null: false
    t.date "start_on"
    t.date "stop_on"
    t.integer "tickets_frequency", default: 0, null: false
    t.string "title", default: "", null: false
    t.datetime "updated_at", null: false
    t.string "where", default: "", null: false
    t.index ["group_id"], name: "index_events_on_group_id"
    t.index ["reserved"], name: "index_events_on_reserved"
    t.index ["start_on"], name: "index_events_on_start_on"
    t.index ["stop_on"], name: "index_events_on_stop_on"
  end

  create_table "groups", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["title"], name: "index_groups_on_title"
  end

  create_table "groups_users", id: false, force: :cascade do |t|
    t.bigint "group_id", null: false
    t.bigint "user_id", null: false
    t.index ["group_id", "user_id"], name: "index_groups_users_on_group_id_and_user_id"
    t.index ["user_id", "group_id"], name: "index_groups_users_on_user_id_and_group_id"
  end

  create_table "happenings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "event_id", null: false
    t.integer "max_tickets", null: false
    t.integer "max_tickets_for_user", default: 1, null: false
    t.datetime "start_at", null: false
    t.datetime "start_sale_at", null: false
    t.datetime "stop_sale_at", null: false
    t.integer "tickets_count", default: 0, null: false
    t.string "title", default: "", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_happenings_on_event_id"
    t.index ["start_at"], name: "index_happenings_on_start_at"
  end

  create_table "options", force: :cascade do |t|
    t.boolean "acceptable", default: true, null: false
    t.datetime "created_at", null: false
    t.bigint "question_id", null: false
    t.string "title", default: "", null: false
    t.datetime "updated_at", null: false
    t.integer "weight", default: 0, null: false
    t.index ["acceptable"], name: "index_options_on_acceptable"
    t.index ["question_id"], name: "index_options_on_question_id"
    t.index ["weight"], name: "index_options_on_weight"
  end

  create_table "questions", force: :cascade do |t|
    t.integer "category", default: 0, null: false
    t.datetime "created_at", null: false
    t.bigint "happening_id", null: false
    t.boolean "mandatory", default: false, null: false
    t.string "title", default: "", null: false
    t.datetime "updated_at", null: false
    t.integer "weight", default: 0, null: false
    t.index ["category"], name: "index_questions_on_category"
    t.index ["happening_id"], name: "index_questions_on_happening_id"
    t.index ["mandatory"], name: "index_questions_on_mandatory"
    t.index ["weight"], name: "index_questions_on_weight"
  end

  create_table "templates", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "data", default: [], null: false
    t.string "title", default: "", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tickets", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "happening_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["happening_id"], name: "index_tickets_on_happening_id"
    t.index ["user_id"], name: "index_tickets_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.boolean "admin", default: false, null: false
    t.datetime "confirmation_sent_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "created_at", null: false
    t.datetime "current_sign_in_at"
    t.string "current_sign_in_ip"
    t.boolean "editor", default: false, null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.integer "failed_attempts", default: 0, null: false
    t.datetime "last_sign_in_at"
    t.string "last_sign_in_ip"
    t.datetime "locked_at"
    t.boolean "member", default: false, null: false
    t.string "name", default: "", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "sign_in_count", default: 0, null: false
    t.string "surname", default: "", null: false
    t.string "unconfirmed_email"
    t.string "unlock_token"
    t.datetime "updated_at", null: false
    t.string "username", default: "", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "answers", "questions"
  add_foreign_key "answers", "tickets"
  add_foreign_key "events", "groups"
  add_foreign_key "happenings", "events"
  add_foreign_key "options", "questions"
  add_foreign_key "questions", "happenings"
  add_foreign_key "tickets", "happenings"
  add_foreign_key "tickets", "users"
end
