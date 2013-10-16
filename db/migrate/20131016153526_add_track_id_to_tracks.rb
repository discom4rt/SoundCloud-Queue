class AddTrackIdToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :track_id, :string
  end
end
