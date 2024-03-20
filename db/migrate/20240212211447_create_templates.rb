class CreateTemplates < ActiveRecord::Migration[7.1]
  def change
    create_table :templates do |t|
      t.string :title, null: false, default: ""
      t.jsonb :data, null: false, default: []

      t.timestamps
    end
  end
end
