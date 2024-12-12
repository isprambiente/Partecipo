# frozen_string_literal: true

# This controller manage the {Event} model
class EventsController < ApplicationController
  # GET /events
  def index
    @categories = Group.pluck :title, :id
    from     = filter_params[:from]
    to       = filter_params[:to]
    group_id = filter_params[:category]
    text     = filter_params[:text]
    @pagy, @events = pagy(Event.searchable(from:, to:, group_id:, text:, soldout:), items: 6)
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
    params.fetch(:filter, {}).permit(:category, :from, :text, :to, :soldout)
  end
end
