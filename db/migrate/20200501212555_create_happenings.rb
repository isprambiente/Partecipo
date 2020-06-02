class CreateHappenings < ActiveRecord::Migration[6.0]
  def change
    create_table :happenings do |t|
      t.references  :fact, null: false, foreign_key: true
      t.string      :detail, null: false, default: ''
      t.datetime    :start_at, null: false
      t.datetime    :start_sale_at, null: false
      t.datetime    :stop_sale_at, null: false
      t.integer     :max_seats
      t.integer     :max_seats_for_ticket, null: false, default: 1
      t.integer     :tickets_count, null: false, default: 0
      t.integer     :seats_count, null: false, default: 0

      t.timestamps
    end
  end
end
