class CreateAnswers < ActiveRecord::Migration[7.1]
  def change
    create_table :answers do |t|
      t.references :ticket, null: false, foreign_key: true
      t.references :question, null: false, foreign_key: true
      t.string :value

      t.timestamps
    end
    add_index :answers, [ :ticket_id, :question_id ], unique: true
  end
end
