class TracksController < ApplicationController

  before_filter :authenticate, :init_user

  def create
    @track = Track.new(track_params)
    @track.user_id = @user.id

    if @track.save
      head :no_content
    else
      head :unprocessable_entity
    end
  end

  def destroy
    @track = @user.tracks.where(:track_id => params[:id]).first
    @track.destroy
    render :nothing => true
  end

  def clear
    @user.tracks.destroy_all
    render :nothing => true
  end

  private

  def track_params
    params.require(:track).permit(:track_id)
  end

end
