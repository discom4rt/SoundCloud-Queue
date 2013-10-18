class RemoveTrackId < ActiveRecord::Migration
  def change
    remove_column :tracks, :track_id
    add_column :tracks, :track_id, :integer, :limit => 8
  end
end
