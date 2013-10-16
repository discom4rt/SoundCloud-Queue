class Track < ActiveRecord::Base
  belongs_to :user

  validates :track_id, :presence => true, :uniqueness => { :scope => :user_id }

  def to_param
    track_id
  end
end
