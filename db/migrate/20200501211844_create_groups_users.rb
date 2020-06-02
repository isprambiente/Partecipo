class CreateGroupsUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :groups_users, id: false do |t|
      t.references :user, null: false, foreign_key: true
      t.references :group, null: false, foreign_key: true
    end
  end
end
