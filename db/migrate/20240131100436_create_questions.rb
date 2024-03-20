class CreateQuestions < ActiveRecord::Migration[7.1]
  def change
    create_table :questions do |t|
      t.references :happening, null: false, foreign_key: true
      t.string :title, null: false, default: ''
      t.integer :weight, null: false, default: 0
      t.integer :category, default: 0, null: false
      t.boolean :mandatory, null: false, default: false

      t.timestamps
    end
    add_index :questions, :weight
    add_index :questions, :mandatory
    add_index :questions, :category
  end
end
