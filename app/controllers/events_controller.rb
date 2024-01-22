# frozen_string_literal: true

# This controller manage the {Fact} model
class EventsController < ApplicationController
  before_action :authenticate_user! if Settings.restricted_access

  # GET /events
  def index
    @categories = Group.pluck :title, :id
    @text = [ "title ilike :text", { text: "%#{filter_params[:text]}%" } ] if filter_params[:text].present?
    search = { stop_on: ((filter_params[:from].try(:to_date) || Date.today)..) }
    search[:start_on] = (..filter_params[:to].try(:to_date)) if filter_params[:to].present?
    search[:group] = filter_params[:category] if filter_params[:category].present?
    @pagy, @events = pagy(Event.where(@text).where(search), items: 6)
  end

  # GET /events/:id
  def show
    @event = Event.find(params[:id])
    @scope = @event.id
    redirect_to happening_path(@event.happenings.last) if @event.single == true
  end

  private

  # Filter params for events search
  def filter_params
    params.fetch(:filter, {}).permit(:category, :from, :text, :to)
  end
end
