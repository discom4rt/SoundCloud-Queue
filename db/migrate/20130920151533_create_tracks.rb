class CreateTracks < ActiveRecord::Migration
  def change
    create_table :tracks do |t|
      t.integer :q_id
      t.timestamps
    end
  end
end
