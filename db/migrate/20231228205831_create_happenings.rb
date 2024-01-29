# frozen_string_literal: true

# This migration make `happenings` table for {happening} model
class CreateHappenings < ActiveRecord::Migration[7.1]
  def change
    create_table :happenings do |t|
      t.references :event, null: false, foreign_key: true
      t.string :title, null: false, default: ''
      t.datetime :start_at, null: false
      t.datetime :start_sale_at, null: false
      t.datetime :stop_sale_at, null: false
      t.integer :max_tickets, null: false
      t.integer :max_tickets_for_user, null: false, default: 1
      t.integer :tickets_count, null: false, default: 0

      t.timestamps
    end
  end
end
