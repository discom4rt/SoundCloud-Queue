class QidToUserid < ActiveRecord::Migration
  def change
    rename_column :tracks, :q_id, :user_id
  end
end
