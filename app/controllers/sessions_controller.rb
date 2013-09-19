class SessionsController < ApplicationController

  SC_TOKEN_KEY = "scat"

  before_filter :init_soundcloud

  def new
    if session[SC_TOKEN_KEY]
      redirect_to stream_path
    else
      redirect_to @client.authorize_url(:scope => "non-expiring")
    end
  end

  def create
    @code = params[:code]
    @access_token = @client.exchange_token(:code => code)
    @user = User.new
    @user.access_token = @access_token

    if @user.save
      session[SC_TOKEN_KEY] = @access_token
      redirect_to stream_path
    else
      render text: "Fuck"
    end
  end

  private

  def init_soundcloud
    @client = Soundcloud.new(:client_id => Rails.application.config.soundcloud_client_id,
                             :client_secret => Rails.application.config.soundcloud_client_secret,
                             :redirect_uri => sessions_url)
  end

end
