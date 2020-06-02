class CreateTickets < ActiveRecord::Migration[6.0]
  def change
    create_table :tickets do |t|
      t.references :happening, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :seats

      t.timestamps
    end
  end
end
