class Users < ActiveRecord::Base
  validates :access_token, :presence => true
end
