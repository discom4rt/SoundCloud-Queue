class CreateQs < ActiveRecord::Migration
  def change
    create_table :qs do |t|
      t.integer :user_id
      t.timestamps
    end
  end
end
