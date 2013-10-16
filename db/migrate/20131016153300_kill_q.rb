class KillQ < ActiveRecord::Migration
  def change
    drop_table :qs
  end
end
