class SessionsController < ApplicationController

  SC_TOKEN_KEY = "scat"

  before_filter :init_soundcloud
  skip_before_filter :authenticate, :only => [:new]

  def new
    redirect_to @client.authorize_url(:scope => "non-expiring")
  end

  def create
    @code = params[:code]
    @access_token = @client.exchange_token(:code => @code)
    @user = User.new
    @user.access_token = @access_token.access_token

    if @user.save
      session[SC_TOKEN_KEY] = @user.access_token
      redirect_to stream_url
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
