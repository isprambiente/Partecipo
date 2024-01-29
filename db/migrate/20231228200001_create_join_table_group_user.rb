# frozen_string_literal: true

# this migration make the join table for {Group} and {User} model
class CreateJoinTableGroupUser < ActiveRecord::Migration[7.1]
  def change
    create_join_table :groups, :users do |t|
      t.index %i[group_id user_id]
      t.index %i[user_id group_id]
    end
  end
end
