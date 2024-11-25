class SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[ new create openid_connect_callback ]
  skip_before_action :verify_authenticity_token, only: :openid_connect_callback
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to new_session_url, alert: "Try again later." }

  def new
  end

  def create
    if user = User.authenticate_by(params.permit(:email_address, :password))
      start_new_session_for user
      redirect_to after_authentication_url
    else
      redirect_to new_session_path, alert: "Try another email address or password."
    end
  end

  def destroy
    terminate_session
    redirect_to new_session_path
  end

  def openid_connect_callback
    @user = User.from_omniauth(request.env["omniauth.auth"])

    if @user.persisted? && @user.errors.empty?
      start_new_session_for user
      redirect_to after_authentication_url
    else
      retirect_to '/502.html'
    end
  end
end
