# frozen_string_literal: true

require 'application_system_test_case'

class Editor::TicketsTest < ApplicationSystemTestCase
  setup do
    @editor_ticket = editor_tickets(:one)
  end

  test 'visiting the index' do
    visit editor_tickets_url
    assert_selector 'h1', text: 'Editor/Tickets'
  end

  test 'creating a Ticket' do
    visit editor_tickets_url
    click_on 'New Editor/Ticket'

    fill_in 'Happenings', with: @editor_ticket.happenings_id
    fill_in 'Seats', with: @editor_ticket.seats
    fill_in 'User', with: @editor_ticket.user_id
    click_on 'Create Ticket'

    assert_text 'Ticket was successfully created'
    click_on 'Back'
  end

  test 'updating a Ticket' do
    visit editor_tickets_url
    click_on 'Edit', match: :first

    fill_in 'Happenings', with: @editor_ticket.happenings_id
    fill_in 'Seats', with: @editor_ticket.seats
    fill_in 'User', with: @editor_ticket.user_id
    click_on 'Update Ticket'

    assert_text 'Ticket was successfully updated'
    click_on 'Back'
  end

  test 'destroying a Ticket' do
    visit editor_tickets_url
    page.accept_confirm do
      click_on 'Destroy', match: :first
    end

    assert_text 'Ticket was successfully destroyed'
  end
end
