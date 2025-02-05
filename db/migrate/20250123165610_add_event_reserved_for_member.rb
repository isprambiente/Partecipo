class AddEventReservedForMember < ActiveRecord::Migration[8.0]
  def change
    add_column :users,  :member, :boolean, null: false, default: false
    add_index  :users,  :member
    add_column :events, :reserved, :boolean, null: false, default: false
    add_index  :events, :reserved
  end
end
