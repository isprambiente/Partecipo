# frozen_string_literal: true

require 'test_helper'

class Editor::TicketsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @editor_ticket = editor_tickets(:one)
  end

  test 'should get index' do
    get editor_tickets_url
    assert_response :success
  end

  test 'should get new' do
    get new_editor_ticket_url
    assert_response :success
  end

  test 'should create editor_ticket' do
    assert_difference('Editor::Ticket.count') do
      post editor_tickets_url, params: { editor_ticket: { happenings_id: @editor_ticket.happenings_id, seats: @editor_ticket.seats, user_id: @editor_ticket.user_id } }
    end

    assert_redirected_to editor_ticket_url(Editor::Ticket.last)
  end

  test 'should show editor_ticket' do
    get editor_ticket_url(@editor_ticket)
    assert_response :success
  end

  test 'should get edit' do
    get edit_editor_ticket_url(@editor_ticket)
    assert_response :success
  end

  test 'should update editor_ticket' do
    patch editor_ticket_url(@editor_ticket), params: { editor_ticket: { happenings_id: @editor_ticket.happenings_id, seats: @editor_ticket.seats, user_id: @editor_ticket.user_id } }
    assert_redirected_to editor_ticket_url(@editor_ticket)
  end

  test 'should destroy editor_ticket' do
    assert_difference('Editor::Ticket.count', -1) do
      delete editor_ticket_url(@editor_ticket)
    end

    assert_redirected_to editor_tickets_url
  end
end
