class ChangeToAccessToken < ActiveRecord::Migration
  def change
    rename_column :users, :soundcloud_access_token, :access_token
  end
end
