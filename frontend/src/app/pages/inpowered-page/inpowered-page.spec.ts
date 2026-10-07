import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { InpoweredPage } from './inpowered-page';

describe('InpoweredPage', () => {
  async function render(page = '/inpowered-about.html', frameTitle = 'About inPowered AI') {
    TestBed.configureTestingModule({
      imports: [InpoweredPage],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(InpoweredPage);
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('frameTitle', frameTitle);
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    return { element: fixture.nativeElement as HTMLElement, navigate };
  }

  function post(data: unknown, origin = window.location.origin) {
    window.dispatchEvent(new MessageEvent('message', { data, origin }));
  }

  it('shows the copy of the page given by the route', async () => {
    const { element } = await render('/inpowered-careers.html', 'Careers at inPowered AI');
    const frame = element.querySelector('iframe');
    expect(frame?.getAttribute('src')).toBe('/inpowered-careers.html');
    expect(frame?.title).toBe('Careers at inPowered AI');
  });

  it('opens the app page asked for by a menu link of the copy', async () => {
    const { navigate } = await render();
    post({ type: 'navigate', url: '/careers' });
    post({ type: 'navigate', url: '/#case-studies' });
    expect(navigate.mock.calls).toEqual([['/careers'], ['/']]);
  });

  it('ignores messages from other origins and links to other sites', async () => {
    const { navigate } = await render();
    post({ type: 'navigate', url: '/login' }, 'https://example.com');
    post({ type: 'navigate', url: '//example.com' });
    post({ type: 'navigate', url: 'https://example.com' });
    expect(navigate).not.toHaveBeenCalled();
  });
});
