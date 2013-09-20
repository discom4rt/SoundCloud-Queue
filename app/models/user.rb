class User < ActiveRecord::Base
  validates :access_token, :presence => true

  has_one :q
end
