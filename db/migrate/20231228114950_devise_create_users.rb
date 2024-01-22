# frozen_string_literal: true

# This migration make `users` table for {User} model
class DeviseCreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      if ENV['PARTECIPO_SSO']
        ## Cas authenticatable
        t.string :username, null: false, default: ''
      else
        ## Database authenticatable
        t.string :email,              null: false, default: ''
        t.string :encrypted_password, null: false, default: ''

        ## Recoverable
        t.string   :reset_password_token
        t.datetime :reset_password_sent_at

        ## Rememberable
        t.datetime :remember_created_at

        ## Confirmable
        t.string   :confirmation_token
        t.datetime :confirmed_at
        t.datetime :confirmation_sent_at
        t.string   :unconfirmed_email # Only if using reconfirmable

        ## Lockable
        t.integer  :failed_attempts, default: 0, null: false # Only if lock strategy is :failed_attempts
        t.string   :unlock_token # Only if unlock strategy is :email or :both
        t.datetime :locked_at
      end

      ## Trackable
      t.integer  :sign_in_count, default: 0, null: false
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string   :current_sign_in_ip
      t.string   :last_sign_in_ip

      ## User specific
      t.boolean   :admin, null: false, default: false
      t.boolean   :editor, null: false, default: false

      t.timestamps null: false
    end

    if ENV['PARTECIPO_SSO']
      add_index :users, :username,             unique: true
    else
      add_index :users, :email,                unique: true
      add_index :users, :reset_password_token, unique: true
      add_index :users, :confirmation_token,   unique: true
      add_index :users, :unlock_token,         unique: true
    end
  end
end
