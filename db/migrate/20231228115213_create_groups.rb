# frozen_string_literal: true

# This migration make `groups` table for {Group} model
class CreateGroups < ActiveRecord::Migration[7.1]
  def change
    create_table :groups do |t|
      t.string :title

      t.timestamps
    end
    add_index :groups, :title
  end
end
