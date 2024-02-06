class CreateOptions < ActiveRecord::Migration[7.1]
  def change
    create_table :options do |t|
      t.references :question, null: false, foreign_key: true
      t.integer :weight, null: false, default: 0
      t.string :title, null: false, default: ''
      t.boolean :acceptable, null: false, default: true

      t.timestamps
    end
    add_index :options, :weight
    add_index :options, :acceptable
  end
end
