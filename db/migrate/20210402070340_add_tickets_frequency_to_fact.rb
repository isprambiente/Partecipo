class AddTicketsFrequencyToFact < ActiveRecord::Migration[6.1]
  def change
    add_column :facts, :tickets_frequency, :integer, null: false, default: 0
  end
end
