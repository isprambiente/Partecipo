# frozen_string_literal: true

# this controller manage the {User} views for {Happening} model.
class HappeningsController < ApplicationController
  # GET /event/:event_id/happenings
  # show a paginate list of {Happening}
  def index
    @categories = Group.pluck :title, :id
    @scope = filter_params[:scope]

    @pagy, @happenings = pagy(
      Happening
        .between(filter_params[:from], filter_params[:to])
        .by_text(filter_params[:text])
        .by_event(@scope)
        .by_group(filter_params[:category]), items: 6)
  end

  # GET /event/:event_id/happenings/:id
  # Show detail of happening and a form to prenotate a ticket
  def show
    @happening = Happening.includes(:event).find(params[:id])
    @event = @happening.event
  end

  private

  # filter params for search {Happening}
  def filter_params
    params.fetch(:filter, {}).permit(:category, :from, :scope, :text, :to)
  end
end
