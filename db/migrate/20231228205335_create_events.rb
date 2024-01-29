# frozen_string_literal: true

# This migration make `events` table for {Event} model
class CreateEvents < ActiveRecord::Migration[7.1]
  def change
    create_table :events do |t|
      t.references :group, null: false, foreign_key: true
      t.string :title, null: false, default: ''
      t.string :where, null: false, default: ''
      t.boolean :pinned, null: false, default: false
      t.date :start_on
      t.date :stop_on
      t.boolean :single, null: false, default: false
      t.integer :tickets_frequency, null: false, default: 0
      t.integer :happenings_count, null: false, default: 0

      t.timestamps
    end
  end
end
