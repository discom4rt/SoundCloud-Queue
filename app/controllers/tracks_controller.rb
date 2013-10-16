class TracksController < ApplicationController

  before_filter :authenticate, :init_user

  def create
    @track = Track.new(params[:track])
    @track.user_id = @user.id

    if @track.save
      head :no_content
    else
      head :unprocessable_entity
    end
  end

  def destroy
    @track = @user.tracks.where(:track_id => params[:track][:track_id])
    @track.destroy
  end

  def clear
    @user.tracks.destroy_all
  end

end
