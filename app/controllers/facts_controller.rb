# frozen_string_literal: true

# This controller manage the {Fact} model
class FactsController < ApplicationController
  before_action :set_fact, only: %i[show]

  # GET /facts
  def index; end

  # GET /facts/:id
  def show; end

  # GET /facts/list
  def list
    type = filter_params[:type] == 'history' ? 'history' : 'future'
    @text = ['title ilike :text', { text: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @pagy, @facts = pagy(Fact.send(type).where(@text))
  end

  private

  # set fact when is needed
  def set_fact
    @fact = Fact.find(params[:id])
  end

  # Filter params for facts search
  def filter_params
    params.fetch(:filter, {}).permit(:text, :type)
  end
end
