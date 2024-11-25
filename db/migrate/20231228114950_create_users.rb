# frozen_string_literal: true

# This migration make `users` table for {User} model
class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string   :username,        null: false, default: ''
      t.string   :email_address,   null: false
      t.string   :password_digest, null: false
      t.string   :name,            null: false, default: ''
      t.string   :surname,         null: false, default: ''
      t.boolean  :admin,           null: false, default: false
      t.boolean  :editor,          null: false, default: false
      t.datetime :confirmed_at
      t.timestamps
    end
    add_index :users, :email_address, unique: true
    add_index :users, :username, unique: true
    add_index :users, :admin
    add_index :users, :editor
  end
end
