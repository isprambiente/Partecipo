class CreateFacts < ActiveRecord::Migration[6.0]
  def change
    create_table :facts do |t|
      t.references :group, null: false, foreign_key: true
      t.string :title, null: false, default: ''
      t.string :where, null: false, default: ''
      t.boolean :pinned, null: false, default: false
      t.date :start_on, null: false
      t.date :stop_on, null: false
      t.integer :happenings_count, null: false, default: 0

      t.timestamps
    end
  end
end
