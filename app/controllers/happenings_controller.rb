# frozen_string_literal: true

# this controller manage the {User} views for {Happening} model.
class HappeningsController < ApplicationController
  # GET /event/:event_id/happenings
  # show a paginate list of {Happening}
  def index
    @categories = Group.pluck :title, :id
    @scope   = filter_params[:scope]
    from     = filter_params[:from]
    to       = filter_params[:to]
    event_id = filter_params[:scope]
    group_id = filter_params[:category]
    text     = filter_params[:text]
    soldout  = filter_params[:soldout]
    @pagy, @happenings = pagy(Happening.searchable(from:, to:, event_id:, group_id:, text:, soldout:), items: 6)
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
    params.fetch(:filter, {}).permit(:category, :from, :scope, :text, :to, :soldout)
  end
end
