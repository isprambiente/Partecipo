# frozen_string_literal: true

# this controller manage the {Happening} model.
# this model is under {FactsController}
class HappeningsController < ApplicationController
  before_action :set_fact
  before_action :set_happening, only: %i[show]
  before_action :set_ticket, only: %i[show]

  # GET /fact/:fact_id/happenings
  # show a paginate list of {Happening}
  def index
    type = filter_paramss[:type] == 'history' ? 'history' : 'future'
    @text = ['detail ilike :text', { text: "%#{filter_paramss[:text]}%" }] if filter_paramss[:text].present?
    @pagy, @happenings = pagy(
      @fact.happenings.send(type).where(@text),
      items: 6
    )
  end

  # GET /fact/:fact_id/happenings/:id
  # Show detail of happening and a form to prenotate a ticket
  def show; end

  private

  # set @fact for any action
  def set_fact
    @fact = Fact.find(params[:fact_id])
  end

  # set @happening when needed
  def set_happening
    @happening = @fact.happenings.find(params[:id])
  end

  # seet @ticket when needed
  def set_ticket
    @ticket = @happening.tickets.find_or_initialize_by(user: current_user)
  end

  # filter params for search {Happening}
  def filter_paramss
    params.fetch(:filter, {}).permit(:text, :type)
  end

  # filter params for {Happening}'s {Ticket}
  def filter_ticket
    params.fetch(:ticket, {}).permit(:seats)
  end
end
